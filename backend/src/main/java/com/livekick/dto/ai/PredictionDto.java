package com.livekick.dto.ai;

import java.time.Instant;

public record PredictionDto(
        Long id,
        Long matchId,
        Double homeWinProbability,
        Double drawProbability,
        Double awayWinProbability,
        Integer predictedHomeScore,
        Integer predictedAwayScore,
        Double confidenceScore,
        String modelName,
        String explanation,
        Instant generatedAt
) {
}
