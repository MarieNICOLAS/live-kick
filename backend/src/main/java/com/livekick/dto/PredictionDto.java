package com.livekick.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record PredictionDto(
        Long id,
        BigDecimal homeWinProbability,
        BigDecimal drawProbability,
        BigDecimal awayWinProbability,
        Integer predictedHomeScore,
        Integer predictedAwayScore,
        BigDecimal confidenceScore,
        String modelName,
        String explanation,
        Instant generatedAt,
        Long matchId,
        Long dataSourceId
) {
}