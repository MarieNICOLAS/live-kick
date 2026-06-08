package com.livekick.dto;

public record MatchStatisticsDto(
        Long id,
        Integer possessionHome,
        Integer possessionAway,
        Integer shotsHome,
        Integer shotsAway,
        Integer shotsOnTargetHome,
        Integer shotsOnTargetAway,
        Integer cornersHome,
        Integer cornersAway,
        Integer foulsHome,
        Integer foulsAway,
        Integer yellowCardsHome,
        Integer yellowCardsAway,
        Integer redCardsHome,
        Integer redCardsAway,
        Long matchId
) {
}