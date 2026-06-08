package com.livekick.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "match_statistics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchStatistics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_statistics")
    private Long id;

    @Column(name = "possession_home")
    private Integer possessionHome;

    @Column(name = "possession_away")
    private Integer possessionAway;

    @Column(name = "shots_home")
    private Integer shotsHome;

    @Column(name = "shots_away")
    private Integer shotsAway;

    @Column(name = "shots_on_target_home")
    private Integer shotsOnTargetHome;

    @Column(name = "shots_on_target_away")
    private Integer shotsOnTargetAway;

    @Column(name = "corners_home")
    private Integer cornersHome;

    @Column(name = "corners_away")
    private Integer cornersAway;

    @Column(name = "fouls_home")
    private Integer foulsHome;

    @Column(name = "fouls_away")
    private Integer foulsAway;

    @Column(name = "yellow_cards_home")
    private Integer yellowCardsHome;

    @Column(name = "yellow_cards_away")
    private Integer yellowCardsAway;

    @Column(name = "red_cards_home")
    private Integer redCardsHome;

    @Column(name = "red_cards_away")
    private Integer redCardsAway;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_match", nullable = false, unique = true)
    private FootballMatch match;
}