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
@Table(name = "matchs")
@Entity
@NamedQueries({
        @NamedQuery(name = "Match::findAll", query = "from Match m"),
        @NamedQuery(name = "Match::findById", query = "from Match m where m.id = ?1"),

})
public class Match {
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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipe_domicile_id", nullable = false)
    private Equipe equipeDomicile;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipe_exterieur_id", nullable = false)
    private Equipe equipeExterieur;

    @ToString.Exclude
    @OneToMany(mappedBy = "match")
    @Builder.Default
    private List<CompositionEquipe> compositionsEquipe = new ArrayList<>();

    @ToString.Exclude
    @OneToMany(mappedBy = "match")
    @Builder.Default
    private List<EvenementMatch> evenementsMatch = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stade_id")
    private Stade stade;
}
