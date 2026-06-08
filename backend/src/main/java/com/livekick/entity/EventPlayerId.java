package com.livekick.entity;

import com.livekick.entity.enums.PlayerEventRole;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class EventPlayerId implements Serializable {

    @Column(name = "id_event")
    private Long eventId;

    @Column(name = "id_player")
    private Long playerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "player_event_role", length = 40)
    private PlayerEventRole playerEventRole;
}