package com.livekick.dto;

public record TeamCompositionDto(
        Long id,
        Boolean isStarting,
        String formation,
        String fieldPosition,
        Long matchId,
        Long teamId,
        Long playerId
) {
}