package com.livekick.entity;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "event_player")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventPlayer {

    @EmbeddedId
    private EventPlayerId id;

    @NotNull
    @MapsId("eventId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_event", nullable = false)
    private MatchEvent event;

    @NotNull
    @MapsId("playerId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_player", nullable = false)
    private Player player;
}