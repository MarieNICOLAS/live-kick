package com.livekick.dto.football;

public record GroupStandingDto(
        TeamSummaryDto team,
        Integer matchesPlayed,
        Integer wins,
        Integer draws,
        Integer losses,
        Integer points,
        Integer goalsFor,
        Integer goalsAgainst,
        Integer goalDifference
) {
}