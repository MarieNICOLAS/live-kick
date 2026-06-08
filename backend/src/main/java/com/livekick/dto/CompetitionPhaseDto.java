package com.livekick.dto;

import com.livekick.entity.enums.CompetitionPhaseType;

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
public class CompetitionPhaseDto {
    private Long id;
    private CompetitionPhaseType phaseType;
    private Integer displayOrder;
    private Long competitionId;
}
