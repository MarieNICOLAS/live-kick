package com.livekick.dto;

import com.livekick.entity.enums.PlayerEventRole;

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
public class EventPlayerDto {
    private Long eventId;
    private Long playerId;
    private PlayerEventRole playerEventRole;
}
