package com.livekick.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchStatisticsDto {
    private Long id;
    private Integer possessionHome;
    private Integer possessionAway;
    private Integer shotsHome;
    private Integer shotsAway;
    private Integer shotsOnTargetHome;
    private Integer shotsOnTargetAway;
    private Integer cornersHome;
    private Integer cornersAway;
    private Integer foulsHome;
    private Integer foulsAway;
    private Integer yellowCardsHome;
    private Integer yellowCardsAway;
    private Integer redCardsHome;
    private Integer redCardsAway;
    private Long matchId;
}
