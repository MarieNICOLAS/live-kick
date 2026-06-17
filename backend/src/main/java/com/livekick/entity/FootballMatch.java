package com.livekick.entity;

import com.livekick.Enum.PhaseMatch;
import com.livekick.Enum.StatusMatch;
import lombok.*;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;


@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor
@Builder
@Table(name = "football_match")
@Entity
@NamedQueries({
        @NamedQuery(name = "FootballMatch::findAll", query = "from FootballMatch m"),
        @NamedQuery(name = "FootballMatch::findById", query = "from FootballMatch m where m.id = ?1"),

})
public class FootballMatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_match", nullable = false)
    private LocalDate dateMatch;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private StatusMatch status; // Stockage du nom en String de l'énumération (EN_COURS, TERMINE, etc.)

    @Column(name = "phase_match", nullable = false)
    @Enumerated(EnumType.STRING)
    private PhaseMatch phaseMatch;

    @Column(name="score_domicile")
    private Integer scoreDomicile;

    @Column(name="score_exterieur")
    private Integer scoreExterieur;

    // Relations

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_home_team", nullable = false)
    private Team homeTeam;

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_away_team", nullable = false)
    private Team awayTeam;

    @ToString.Exclude
    @OneToMany(mappedBy = "footballMatch")
    @Builder.Default
    private List<TeamComposition> teamCompositions = new ArrayList<>();

    @ToString.Exclude
    @OneToMany(mappedBy = "footballMatch")
    @Builder.Default
    private List<MatchEvent> matchEvents = new ArrayList<>();

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_stadium")
    private Stadium stadium;
}
