package com.livekick.dto;

import java.math.BigDecimal;
import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictionDto {
    private Long id;
    private BigDecimal homeWinProbability;
    private BigDecimal drawProbability;
    private BigDecimal awayWinProbability;
    private Integer predictedHomeScore;
    private Integer predictedAwayScore;
    private BigDecimal confidenceScore;
    private String modelName;
    private String explanation;
    private Instant generatedAt;
    private Long matchId;
    private Long dataSourceId;
}
