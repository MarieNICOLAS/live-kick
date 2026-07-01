package com.livekick.service.ai;

import com.livekick.dto.ai.PredictionDto;
import com.livekick.dto.football.CompetitionGroupDto;
import com.livekick.dto.football.FootballMatchDto;
import com.livekick.dto.football.GroupStandingDto;
import com.livekick.dto.football.StadiumDto;
import com.livekick.dto.football.TeamFormMatchDto;
import com.livekick.dto.football.TeamStatisticsDto;
import com.livekick.dto.football.TeamSummaryDto;
import com.livekick.exception.BadRequestException;
import com.livekick.exception.ExternalServiceException;
import com.livekick.integration.ai.AiPredictionClient;
import com.livekick.integration.ai.AiPredictionRequest;
import com.livekick.repository.PredictionRepository;
import com.livekick.service.football.FootballDataService;
import com.livekick.service.football.TeamStatisticsService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class PredictionService {

    private static final String FALLBACK_MODEL_NAME = "None";
    private static final String LOCAL_MODEL_NAME = "LiveKick heuristique locale";

    private final PredictionRepository predictionRepository;
    private final FootballDataService footballDataService;
    private final TeamStatisticsService teamStatisticsService;
    private final AiPredictionClient aiPredictionClient;

    public PredictionService(
            PredictionRepository predictionRepository,
            FootballDataService footballDataService,
            TeamStatisticsService teamStatisticsService,
            AiPredictionClient aiPredictionClient
    ) {
        this.predictionRepository = predictionRepository;
        this.footballDataService = footballDataService;
        this.teamStatisticsService = teamStatisticsService;
        this.aiPredictionClient = aiPredictionClient;
    }

    public PredictionDto getPrediction(Long matchId) {
        return predictionRepository.findLatestByMatchId(matchId)
                .filter(this::isUsablePrediction)
                .orElseGet(() -> generatePrediction(matchId));
    }

    public List<PredictionDto> getKnownMatchPredictions() {
        return footballDataService.getMatches(null, null, null).stream()
                .filter(this::isPredictableMatch)
                .map(match -> getPrediction(match.id()))
                .toList();
    }

    public List<PredictionDto> getUpcomingKnownMatchPredictions() {
        return footballDataService.getMatches(null, null, "SCHEDULED").stream()
                .filter(this::isPredictableMatch)
                .map(match -> getPrediction(match.id()))
                .toList();
    }

    private PredictionDto generatePrediction(Long matchId) {
        FootballMatchDto match = footballDataService.getMatch(matchId);
        validatePredictableMatch(match);

        PredictionDto prediction = generateAiBackedPrediction(match);

        return predictionRepository.save(prediction);
    }

    private PredictionDto generateAiBackedPrediction(FootballMatchDto match) {
        try {
            PredictionDto prediction = validatePrediction(
                    aiPredictionClient.predict(buildRequest(match))
            );

            if (isUsablePrediction(prediction)) {
                return prediction;
            }
        } catch (ExternalServiceException exception) {
            return buildLocalPrediction(match, "Le service IA est indisponible. LiveKick utilise les donnees locales disponibles.");
        }

        return buildLocalPrediction(match, "Le moteur IA a retourne une prediction vide. LiveKick utilise les donnees locales disponibles.");
    }

    private PredictionDto buildLocalPrediction(FootballMatchDto match, String reason) {
        TeamPredictionProfile homeProfile = buildTeamPredictionProfile(match.homeTeam(), match.groupCode());
        TeamPredictionProfile awayProfile = buildTeamPredictionProfile(match.awayTeam(), match.groupCode());

        double homeStrength = homeProfile.strength() + 2.5;
        double awayStrength = awayProfile.strength();
        double strengthGap = homeStrength - awayStrength;

        double drawProbability = roundProbability(clamp(18.0, 32.0, 28.0 - Math.abs(strengthGap) * 0.38));
        double remainingProbability = 100.0 - drawProbability;
        double homeShare = clamp(0.22, 0.78, 0.5 + strengthGap / 70.0);
        double homeWinProbability = roundProbability(remainingProbability * homeShare);
        double awayWinProbability = roundProbability(100.0 - drawProbability - homeWinProbability);
        double confidenceScore = roundProbability(clamp(
                54.0,
                84.0,
                56.0 + Math.abs(strengthGap) * 0.55 + (homeProfile.dataConfidence() + awayProfile.dataConfidence()) / 2.0
        ));

        int homeScore = predictedGoals(homeProfile.attackRating(), awayProfile.defenseRating(), 0.18);
        int awayScore = predictedGoals(awayProfile.attackRating(), homeProfile.defenseRating(), 0.0);

        return new PredictionDto(
                null,
                match.id(),
                homeWinProbability,
                drawProbability,
                awayWinProbability,
                homeScore,
                awayScore,
                confidenceScore,
                LOCAL_MODEL_NAME,
                buildLocalExplanation(reason, homeProfile, awayProfile),
                Instant.now()
        );
    }

    private TeamPredictionProfile buildTeamPredictionProfile(TeamSummaryDto team, String groupCode) {
        TeamStatisticsDto statistics = resolveStatistics(team);
        GroupStandingDto standing = resolveGroupStanding(team, groupCode);

        boolean hasStatistics = statistics != null && safeInteger(statistics.matchesPlayed()) > 0;
        boolean hasStanding = standing != null && safeInteger(standing.matchesPlayed()) > 0;

        double attackRating = 1.2;
        double defenseRating = 1.2;
        double strength = 50.0;
        double dataConfidence = 0.0;

        if (hasStatistics) {
            int matchesPlayed = safeInteger(statistics.matchesPlayed());
            double goalDifferencePerMatch = safeInteger(statistics.goalDifference()) * 1.0 / matchesPlayed;
            double recentFormScore = recentFormScore(statistics.recentForm());

            attackRating = positiveOrDefault(statistics.averageGoalsFor(), attackRating);
            defenseRating = positiveOrDefault(statistics.averageGoalsAgainst(), defenseRating);
            strength += (safeDouble(statistics.winRate()) - 33.0) * 0.28;
            strength += goalDifferencePerMatch * 5.0;
            strength += recentFormScore * 2.0;
            dataConfidence += 8.0;
        }

        if (hasStanding) {
            int matchesPlayed = safeInteger(standing.matchesPlayed());
            double pointsPerMatch = safeInteger(standing.points()) * 1.0 / matchesPlayed;
            double goalDifferencePerMatch = safeInteger(standing.goalDifference()) * 1.0 / matchesPlayed;
            double goalsForPerMatch = safeInteger(standing.goalsFor()) * 1.0 / matchesPlayed;
            double goalsAgainstPerMatch = safeInteger(standing.goalsAgainst()) * 1.0 / matchesPlayed;

            attackRating = Math.max(attackRating, goalsForPerMatch);
            defenseRating = Math.min(defenseRating, goalsAgainstPerMatch);
            strength += (pointsPerMatch - 1.25) * 8.0;
            strength += goalDifferencePerMatch * 4.0;
            strength += (goalsForPerMatch - goalsAgainstPerMatch) * 2.0;
            dataConfidence += 7.0;
        }

        return new TeamPredictionProfile(
                displayTeamName(team),
                clamp(25.0, 85.0, strength),
                clamp(0.2, 3.4, attackRating),
                clamp(0.2, 3.4, defenseRating),
                dataConfidence,
                hasStatistics,
                hasStanding
        );
    }

    private TeamStatisticsDto resolveStatistics(TeamSummaryDto team) {
        if (team == null || team.id() == null) {
            return null;
        }

        try {
            return teamStatisticsService.getTeamStatistics(team.id());
        } catch (RuntimeException exception) {
            return null;
        }
    }

    private GroupStandingDto resolveGroupStanding(TeamSummaryDto team, String groupCode) {
        if (team == null || team.id() == null || isBlank(groupCode)) {
            return null;
        }

        try {
            CompetitionGroupDto group = footballDataService.getGroup(groupCode);
            if (group == null || group.standings() == null) {
                return null;
            }

            return group.standings().stream()
                    .filter(standing -> standing.team() != null)
                    .filter(standing -> Objects.equals(standing.team().id(), team.id()))
                    .findFirst()
                    .orElse(null);
        } catch (RuntimeException exception) {
            return null;
        }
    }

    private double recentFormScore(List<TeamFormMatchDto> recentForm) {
        if (recentForm == null || recentForm.isEmpty()) {
            return 0.0;
        }

        double total = 0.0;
        for (TeamFormMatchDto match : recentForm) {
            total += switch (Optional.ofNullable(match.result()).orElse("")) {
                case "WIN" -> 1.0;
                case "DRAW" -> 0.25;
                case "LOSS" -> -0.75;
                default -> 0.0;
            };
        }
        return total / recentForm.size();
    }

    private int predictedGoals(double ownAttackRating, double opponentDefenseRating, double homeAdvantage) {
        double rawGoals = 0.55 + ownAttackRating * 0.58 + opponentDefenseRating * 0.22 + homeAdvantage;
        return (int) Math.round(clamp(0.0, 4.0, rawGoals));
    }

    private String buildLocalExplanation(String reason, TeamPredictionProfile homeProfile, TeamPredictionProfile awayProfile) {
        String dataSource = homeProfile.hasDatabaseData() || awayProfile.hasDatabaseData()
                ? "Calcul effectue depuis SQLite: classements de groupe, buts, resultats et forme recente disponibles."
                : "Les donnees SQLite sont insuffisantes pour ces equipes; LiveKick applique une base neutre sans donnees mockees.";

        return reason + " " + dataSource + " Comparaison locale: "
                + homeProfile.teamName() + " force " + roundProbability(homeProfile.strength())
                + ", " + awayProfile.teamName() + " force " + roundProbability(awayProfile.strength())
                + ". La prediction sera remplacee automatiquement si le service IA renvoie une prediction complete.";
    }

    private String displayTeamName(TeamSummaryDto team) {
        return Optional.ofNullable(team)
                .map(TeamSummaryDto::name)
                .filter(name -> !name.isBlank())
                .orElse("Equipe inconnue");
    }

    private double positiveOrDefault(Double value, double defaultValue) {
        return value == null || value <= 0.0 ? defaultValue : value;
    }

    private int safeInteger(Integer value) {
        return value == null ? 0 : value;
    }

    private double safeDouble(Double value) {
        return value == null ? 0.0 : value;
    }

    private double clamp(double minimum, double maximum, double value) {
        return Math.min(maximum, Math.max(minimum, value));
    }

    private double roundProbability(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private AiPredictionRequest buildRequest(FootballMatchDto match) {
        return new AiPredictionRequest(
                match.id(),
                toTeamContext(match.homeTeam()),
                toTeamContext(match.awayTeam()),
                resolveStadiumName(match.stadiumId())
        );
    }

    private AiPredictionRequest.TeamContext toTeamContext(TeamSummaryDto team) {
        return new AiPredictionRequest.TeamContext(team.name(), team.fifaCode());
    }

    private String resolveStadiumName(Long stadiumId) {
        if (stadiumId == null) {
            return "Unknown stadium";
        }

        try {
            StadiumDto stadium = footballDataService.getStadium(stadiumId);
            return Optional.ofNullable(stadium.name())
                    .filter(name -> !name.isBlank())
                    .orElse("Unknown stadium");
        } catch (RuntimeException exception) {
            return "Unknown stadium";
        }
    }

    private void validatePredictableMatch(FootballMatchDto match) {
        if (match.homeTeam() == null || match.awayTeam() == null) {
            throw new BadRequestException("Prediction requires both teams to be known");
        }

        validateTeam(match.homeTeam(), "home");
        validateTeam(match.awayTeam(), "away");
    }

    private boolean isPredictableMatch(FootballMatchDto match) {
        return match.id() != null
                && isPredictableTeam(match.homeTeam())
                && isPredictableTeam(match.awayTeam());
    }

    private boolean isPredictableTeam(TeamSummaryDto team) {
        return team != null
                && !isBlank(team.name())
                && !isBlank(team.fifaCode())
                && team.fifaCode().length() >= 2
                && team.fifaCode().length() <= 3;
    }

    private void validateTeam(TeamSummaryDto team, String side) {
        if (isBlank(team.name())) {
            throw new BadRequestException("Prediction requires a " + side + " team name");
        }
        if (isBlank(team.fifaCode()) || team.fifaCode().length() < 2 || team.fifaCode().length() > 3) {
            throw new BadRequestException("Prediction requires a valid " + side + " team FIFA code");
        }
    }

    private PredictionDto validatePrediction(PredictionDto prediction) {
        if (prediction.matchId() == null
                || prediction.homeWinProbability() == null
                || prediction.drawProbability() == null
                || prediction.awayWinProbability() == null
                || prediction.predictedHomeScore() == null
                || prediction.predictedAwayScore() == null
                || prediction.confidenceScore() == null
                || isBlank(prediction.modelName())) {
            throw new ExternalServiceException("AI service returned an invalid prediction response");
        }

        if (!isProbability(prediction.homeWinProbability())
                || !isProbability(prediction.drawProbability())
                || !isProbability(prediction.awayWinProbability())
                || !isProbability(prediction.confidenceScore())
                || prediction.predictedHomeScore() < 0
                || prediction.predictedAwayScore() < 0) {
            throw new ExternalServiceException("AI service returned prediction values outside accepted range");
        }

        return new PredictionDto(
                prediction.id(),
                prediction.matchId(),
                prediction.homeWinProbability(),
                prediction.drawProbability(),
                prediction.awayWinProbability(),
                prediction.predictedHomeScore(),
                prediction.predictedAwayScore(),
                prediction.confidenceScore(),
                prediction.modelName(),
                Optional.ofNullable(prediction.explanation()).orElse("No explanation provided."),
                Optional.ofNullable(prediction.generatedAt()).orElseGet(Instant::now)
        );
    }

    private boolean isProbability(Double value) {
        return value >= 0.0 && value <= 100.0;
    }

    private boolean isFallbackPrediction(PredictionDto prediction) {
        return FALLBACK_MODEL_NAME.equalsIgnoreCase(prediction.modelName());
    }

    private boolean isUsablePrediction(PredictionDto prediction) {
        return prediction != null
                && !isFallbackPrediction(prediction)
                && prediction.homeWinProbability() != null
                && prediction.drawProbability() != null
                && prediction.awayWinProbability() != null
                && prediction.homeWinProbability() + prediction.drawProbability() + prediction.awayWinProbability() > 0.0;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private record TeamPredictionProfile(
            String teamName,
            double strength,
            double attackRating,
            double defenseRating,
            double dataConfidence,
            boolean hasStatistics,
            boolean hasStanding
    ) {
        private boolean hasDatabaseData() {
            return hasStatistics || hasStanding;
        }
    }
}
