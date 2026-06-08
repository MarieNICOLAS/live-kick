package com.livekick.dto;

import com.livekick.entity.enums.FootballMatchStatus;

import java.time.Instant;

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
public class FootballMatchDto {
    private Long id;
    private Instant matchDate;
    private FootballMatchStatus status;
    private Integer homeScore;
    private Integer awayScore;
    private Integer currentMinute;
    private Integer extraTime;
    private Long homeTeamId;
    private Long awayTeamId;
    private Long stadiumId;
    private Long phaseId;
}
