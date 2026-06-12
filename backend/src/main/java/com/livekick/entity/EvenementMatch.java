package com.livekick.entity;


import com.livekick.Enum.TypeEvenement;

import lombok.*;

import jakarta.persistence.*;


@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor
@Builder
@Table(name = "evenement_matchs")
@Entity
@NamedQueries({
        @NamedQuery(name = "EvenementMatch::findAll", query = "from EvenementMatch em"),
        @NamedQuery(name = "EvenementMatch::findById", query = "from EvenementMatch em where em.id = ?1"),

})
public class EvenementMatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "type_evenement", nullable = false)
    @Enumerated(EnumType.STRING)
    private TypeEvenement typeEvenement;

    @Column(name = "minute", nullable = false)
    private Integer minute;

    @Column(name = "description")
    private String description;

    // Relations

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "joueur_id")
    private Joueur joueur;
}
