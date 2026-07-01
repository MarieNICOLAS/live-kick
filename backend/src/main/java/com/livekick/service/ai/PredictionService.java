package com.livekick.service.ai;

import com.livekick.dto.ai.PredictionDto;
import com.livekick.dto.football.FootballMatchDto;
import com.livekick.dto.football.StadiumDto;
import com.livekick.dto.football.TeamSummaryDto;
import com.livekick.exception.BadRequestException;
import com.livekick.exception.ExternalServiceException;
import com.livekick.integration.ai.AiPredictionClient;
import com.livekick.integration.ai.AiPredictionRequest;
import com.livekick.repository.PredictionRepository;
import com.livekick.service.football.FootballDataService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class PredictionService {

    private static final String FALLBACK_MODEL_NAME = "None";
    private static final String LOCAL_MODEL_NAME = "LiveKick heuristique locale";

    private final PredictionRepository predictionRepository;
    private final FootballDataService footballDataService;
    private final AiPredictionClient aiPredictionClient;

    public PredictionService(
            PredictionRepository predictionRepository,
            FootballDataService footballDataService,
            AiPredictionClient aiPredictionClient
    ) {
        this.predictionRepository = predictionRepository;
        this.footballDataService = footballDataService;
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
            return buildLocalPrediction(match, "Le service IA est indisponible. LiveKick utilise une estimation locale basée sur les équipes connues.");
        }

        return buildLocalPrediction(match, "Le moteur IA a retourné une prédiction vide. LiveKick utilise une estimation locale basée sur les équipes connues.");
    }

    private PredictionDto buildLocalPrediction(FootballMatchDto match, String reason) {
        double homeStrength = teamStrength(match.homeTeam()) + 2.5;
        double awayStrength = teamStrength(match.awayTeam());
        double strengthGap = homeStrength - awayStrength;

        double drawProbability = roundProbability(clamp(18.0, 32.0, 28.0 - Math.abs(strengthGap) * 0.38));
        double remainingProbability = 100.0 - drawProbability;
        double homeShare = clamp(0.22, 0.78, 0.5 + strengthGap / 70.0);
        double homeWinProbability = roundProbability(remainingProbability * homeShare);
        double awayWinProbability = roundProbability(100.0 - drawProbability - homeWinProbability);
        double confidenceScore = roundProbability(clamp(54.0, 79.0, 58.0 + Math.abs(strengthGap) * 0.62));

        int homeScore = predictedGoals(homeStrength, strengthGap, match.id());
        int awayScore = predictedGoals(awayStrength, -strengthGap, match.id() == null ? 0L : match.id() + 17L);

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
                reason + " Les probabilités restent indicatives et seront remplacées automatiquement si le service IA renvoie une prédiction complète.",
                Instant.now()
        );
    }

    private double teamStrength(TeamSummaryDto team) {
        String seed = (Optional.ofNullable(team.fifaCode()).orElse("") + Optional.ofNullable(team.name()).orElse(""))
                .toUpperCase();
        int hash = Math.abs(seed.hashCode());
        return 48.0 + (hash % 3600) / 100.0;
    }

    private int predictedGoals(double strength, double advantage, Long seed) {
        long normalizedSeed = seed == null ? 0L : Math.abs(seed);
        double seedBoost = (normalizedSeed % 3) * 0.18;
        double rawGoals = 0.65 + strength / 52.0 + advantage / 38.0 + seedBoost;
        return (int) Math.round(clamp(0.0, 4.0, rawGoals));
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
}
