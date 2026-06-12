package com.livekick.entity;

import lombok.*;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;


@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor
@Builder
@Table(name = "equipes")
@Entity
@NamedQueries({
        @NamedQuery(name = "Equipe::findAll", query = "from Equipe e"),
        @NamedQuery(name = "Equipe::findById", query = "from Equipe e where e.id = ?1"),

})
public class Equipe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "code_pays", nullable = false)
    private String codePays;

    @Column(name = "drapeau_url")
    private String drapeauUrl;

    @Column(name = "entraineur")
    private String entraineur;

    // Relations

    @ToString.Exclude
    @OneToMany(mappedBy = "equipeDomicile")
    @Builder.Default
    private List<Match> matchsDomicile = new ArrayList<>();

    @ToString.Exclude
    @OneToMany(mappedBy = "equipeExterieur")
    @Builder.Default
    private List<Match> matchsExterieur = new ArrayList<>();

    @ToString.Exclude
    @OneToMany(mappedBy = "equipe")
    @Builder.Default
    private List<CompositionEquipe> compositionsEquipe = new ArrayList<>();

    @ToString.Exclude
    @OneToOne(mappedBy = "equipe")
    private EquipeGroupe equipeGroupe;
}
