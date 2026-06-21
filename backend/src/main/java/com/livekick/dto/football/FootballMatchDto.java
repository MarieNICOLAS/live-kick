package com.livekick.dto.football;

import java.time.LocalDateTime;

public record FootballMatchDto(
        Long id,
        LocalDateTime matchDate,
        String status,
        String phase,
        String phaseType,
        String groupCode,
        Integer matchday,
        Integer homeScore,
        Integer awayScore,
        Integer currentMinute,
        TeamSummaryDto homeTeam,
        TeamSummaryDto awayTeam,
        Long stadiumId
) {
}