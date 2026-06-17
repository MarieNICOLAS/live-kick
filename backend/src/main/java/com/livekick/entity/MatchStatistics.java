package com.livekick.entity;

import lombok.*;

import jakarta.persistence.*;


@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor
@Builder
@Table(name = "match_statistics")
@Entity
@NamedQueries({
        @NamedQuery(name = "MatchStatistics::findAll", query = "from MatchStatistics sm"),
        @NamedQuery(name = "MatchStatistics::findById", query = "from MatchStatistics sm where sm.id = ?1"),

})
public class MatchStatistics {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "possession_domicile", nullable = false)
    @Builder.Default
    private Integer possessionDomicile = 0;

    @Column(name = "possession_exterieur", nullable = false)
    @Builder.Default
    private Integer possessionExterieur = 0;

    @Column(name = "tirs_domicile", nullable = false)
    @Builder.Default
    private Integer tirsDomicile = 0;

    @Column(name = "tirs_exterieur", nullable = false)
    @Builder.Default
    private Integer tirsExterieur = 0;

    @Column(name = "tirs_cadres_domicile", nullable = false)
    @Builder.Default
    private Integer tirsCadresDomicile = 0;

    @Column(name = "tirs_cadres_exterieur", nullable = false)
    @Builder.Default
    private Integer tirsCadresExterieur = 0;

    @Column(name = "corners_domicile", nullable = false)
    @Builder.Default
    private Integer cornersDomicile = 0;

    @Column(name = "corners_exterieur", nullable = false)
    @Builder.Default
    private Integer cornersExterieur = 0;

    @Column(name = "fautes_domicile", nullable = false)
    @Builder.Default
    private Integer fautesDomicile = 0;

    @Column(name = "fautes_exterieur", nullable = false)
    @Builder.Default
    private Integer fautesExterieur = 0;

    @Column(name = "cartons_jaunes_domicile", nullable = false)
    @Builder.Default
    private Integer cartonsJaunesDomicile = 0;

    @Column(name = "cartons_jaunes_exterieur", nullable = false)
    @Builder.Default
    private Integer cartonsJaunesExterieur = 0;

    @Column(name = "cartons_rouges_domicile", nullable = false)
    @Builder.Default
    private Integer cartonsRougesDomicile = 0;

    @Column(name = "cartons_rouges_exterieur", nullable = false)
    @Builder.Default
    private Integer cartonsRougesExterieur = 0;

    @Column(name = "score_tab_domicile", nullable = false)
    @Builder.Default
    private Integer scoreTabDomicile = 0;

    @Column(name = "score_tab_exterieur", nullable = false)
    @Builder.Default
    private Integer scoreTabExterieur = 0;

    @Column(name = "minute_courante", nullable = false)
    @Builder.Default
    private Integer minuteCourante = 0;

    // Relations

    @ToString.Exclude
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_football_match", nullable = false, unique = true)
    private FootballMatch footballMatch;
}
