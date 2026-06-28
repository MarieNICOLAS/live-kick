package com.livekick.dto.football;

public record TeamComparisonDto(
        TeamStatisticsDto firstTeamStatistics,
        TeamStatisticsDto secondTeamStatistics
) {
}
