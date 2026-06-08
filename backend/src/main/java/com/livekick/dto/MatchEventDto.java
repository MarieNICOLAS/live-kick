package com.livekick.dto;

import com.livekick.entity.enums.MatchEventType;

public record MatchEventDto(
        Long id,
        MatchEventType eventType,
        Integer minute,
        Integer extraMinute,
        String description,
        Long matchId
) {
}