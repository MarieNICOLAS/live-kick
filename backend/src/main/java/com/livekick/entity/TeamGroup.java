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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "team_group")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_team_group")
    private Long id;

    @NotNull
    @Column(name = "points", nullable = false)
    private Integer points;

    @NotNull
    @Column(name = "wins", nullable = false)
    private Integer wins;

    @NotNull
    @Column(name = "draws", nullable = false)
    private Integer draws;

    @NotNull
    @Column(name = "losses", nullable = false)
    private Integer losses;

    @NotNull
    @Column(name = "goals_for", nullable = false)
    private Integer goalsFor;

    @NotNull
    @Column(name = "goals_against", nullable = false)
    private Integer goalsAgainst;

    @NotNull
    @Column(name = "goal_difference", nullable = false)
    private Integer goalDifference;

    @Column(name = "ranking")
    private Integer ranking;

    @NotNull
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_team", nullable = false)
    private Team team;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_group", nullable = false)
    private CompetitionGroup group;
}