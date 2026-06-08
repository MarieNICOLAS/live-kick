package com.livekick.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "team_composition")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamComposition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_composition")
    private Long id;

    @NotNull
    @Column(name = "is_starting", nullable = false)
    private Boolean isStarting;

    @Size(max = 30)
    @Column(name = "formation", length = 30)
    private String formation;

    @Size(max = 30)
    @Column(name = "field_position", length = 30)
    private String fieldPosition;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_match", nullable = false)
    private FootballMatch match;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_team", nullable = false)
    private Team team;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_player", nullable = false)
    private Player player;
}