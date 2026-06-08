package com.livekick.dto;

import com.livekick.entity.enums.MatchEventType;

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
public class MatchEventDto {
    private Long id;
    private MatchEventType eventType;
    private Integer minute;
    private Integer extraMinute;
    private String description;
    private Long matchId;
}
