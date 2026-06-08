package com.livekick.dto;

import com.livekick.entity.enums.PlayerEventRole;

public record EventPlayerDto(
        Long eventId,
        Long playerId,
        PlayerEventRole playerEventRole
) {
}