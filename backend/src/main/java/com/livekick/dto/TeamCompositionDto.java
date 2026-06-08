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
public class TeamCompositionDto {
    private Long id;
    private Boolean isStarting;
    private String formation;
    private String fieldPosition;
    private Long matchId;
    private Long teamId;
    private Long playerId;
}
