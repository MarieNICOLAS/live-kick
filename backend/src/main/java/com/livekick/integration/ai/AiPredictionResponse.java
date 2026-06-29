package com.livekick.integration.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.livekick.dto.ai.PredictionDto;

import java.time.Instant;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiPredictionResponse(
        @JsonProperty("match_id") Long matchId,
        @JsonProperty("home_win_probability") Double homeWinProbability,
        @JsonProperty("draw_probability") Double drawProbability,
        @JsonProperty("away_win_probability") Double awayWinProbability,
        @JsonProperty("predicted_home_score") Integer predictedHomeScore,
        @JsonProperty("predicted_away_score") Integer predictedAwayScore,
        @JsonProperty("confidence_score") Double confidenceScore,
        @JsonProperty("model_name") String modelName,
        String explanation,
        @JsonProperty("generated_at") Instant generatedAt
) {
    public PredictionDto toPredictionDto() {
        return new PredictionDto(
                null,
                matchId,
                homeWinProbability,
                drawProbability,
                awayWinProbability,
                predictedHomeScore,
                predictedAwayScore,
                confidenceScore,
                modelName,
                explanation,
                generatedAt
        );
    }
}
