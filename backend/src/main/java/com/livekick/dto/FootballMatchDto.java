package com.livekick.dto;

import com.livekick.entity.enums.FootballMatchStatus;

import java.time.Instant;

public record FootballMatchDto(
        Long id,
        Instant matchDate,
        FootballMatchStatus status,
        Integer homeScore,
        Integer awayScore,
        Integer currentMinute,
        Integer extraTime,
        Long homeTeamId,
        Long awayTeamId,
        Long stadiumId,
        Long phaseId
) {
}