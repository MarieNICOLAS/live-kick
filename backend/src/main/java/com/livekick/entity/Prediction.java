package com.livekick.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "prediction")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_prediction")
    private Long id;

    @NotNull
    @Column(name = "home_win_probability", nullable = false, precision = 5, scale = 2)
    private BigDecimal homeWinProbability;

    @NotNull
    @Column(name = "draw_probability", nullable = false, precision = 5, scale = 2)
    private BigDecimal drawProbability;

    @NotNull
    @Column(name = "away_win_probability", nullable = false, precision = 5, scale = 2)
    private BigDecimal awayWinProbability;

    @Column(name = "predicted_home_score")
    private Integer predictedHomeScore;

    @Column(name = "predicted_away_score")
    private Integer predictedAwayScore;

    @Column(name = "confidence_score", precision = 5, scale = 2)
    private BigDecimal confidenceScore;

    @NotBlank
    @Size(max = 120)
    @Column(name = "model_name", nullable = false, length = 120)
    private String modelName;

    @Size(max = 2000)
    @Column(name = "explanation", length = 2000)
    private String explanation;

    @NotNull
    @Column(name = "generated_at", nullable = false)
    private Instant generatedAt;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_match", nullable = false)
    private FootballMatch match;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_data_source")
    private DataSource dataSource;
}