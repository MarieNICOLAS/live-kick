package com.livekick.dto;

import java.time.Instant;

public record TeamGroupDto(
        Long id,
        Integer points,
        Integer wins,
        Integer draws,
        Integer losses,
        Integer goalsFor,
        Integer goalsAgainst,
        Integer goalDifference,
        Integer ranking,
        Instant updatedAt,
        Long teamId,
        Long groupId
) {
}