package com.livekick.dto.football;

import  java.util.List;

public record TeamStatisticsDto(
        long id,
        TeamSummaryDto team,
        Integer matchesPlayed,
        Integer wins,
        Integer draws,
        Integer losses,
        Integer goalsFor,
        Integer goalsAgainst,
        Integer goalDifference,
        Double winRate,
        Double averageGoalsFor,
        Double averageGoalsAgainst,
        List<TeamFormMatchDto> recentForm
){
}
