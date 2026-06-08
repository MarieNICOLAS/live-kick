package com.livekick.dto;

public record TeamDto(
        Long id,
        String name,
        String fifaCode,
        String country,
        String flagUrl,
        String coachName,
        Integer worldRanking
) {
}