package com.livekick.dto;

public record CompetitionGroupDto(
        Long id,
        String name,
        Integer displayOrder,
        Long phaseId
) {
}