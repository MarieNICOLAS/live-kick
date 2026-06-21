package com.livekick.dto.football;

public record FootballMatchLiveDto(
        Long id,
        String status,
        Integer homeScore,
        Integer awayScore,
        Integer currentMinute,
        boolean finished
) {
}