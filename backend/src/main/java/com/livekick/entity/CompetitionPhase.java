package com.livekick.entity;

import com.livekick.entity.enums.CompetitionPhaseType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "competition_phase")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompetitionPhase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_phase")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "phase_type", nullable = false, length = 40)
    private CompetitionPhaseType phaseType;

    @NotNull
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_competition", nullable = false)
    private Competition competition;
}