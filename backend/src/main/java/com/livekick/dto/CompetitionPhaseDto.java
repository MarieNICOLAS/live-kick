package com.livekick.dto;

import com.livekick.entity.enums.CompetitionPhaseType;

public record CompetitionPhaseDto(
        Long id,
        CompetitionPhaseType phaseType,
        Integer displayOrder,
        Long competitionId
) {
}