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
import java.util.Optional;

@Service
public class PredictionService {

    private static final String FALLBACK_MODEL_NAME = "None";

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
                .orElseGet(() -> generatePrediction(matchId));
    }

    private PredictionDto generatePrediction(Long matchId) {
        FootballMatchDto match = footballDataService.getMatch(matchId);
        validatePredictableMatch(match);

        PredictionDto prediction = validatePrediction(
                aiPredictionClient.predict(buildRequest(match))
        );

        if (isFallbackPrediction(prediction)) {
            return prediction;
        }

        return predictionRepository.save(prediction);
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

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
