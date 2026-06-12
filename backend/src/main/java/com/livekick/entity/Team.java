package com.livekick.entity;

import lombok.*;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;


@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor
@Builder
@Table(name = "team")
@Entity
@NamedQueries({
        @NamedQuery(name = "Team::findAll", query = "from Team e"),
        @NamedQuery(name = "Team::findById", query = "from Team e where e.id = ?1"),

})
public class Team {
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
    @OneToMany(mappedBy = "homeTeam")
    @Builder.Default
    private List<FootballMatch> homeMatches = new ArrayList<>();

    @ToString.Exclude
    @OneToMany(mappedBy = "awayTeam")
    @Builder.Default
    private List<FootballMatch> awayMatches = new ArrayList<>();

    @ToString.Exclude
    @OneToMany(mappedBy = "team")
    @Builder.Default
    private List<TeamComposition> teamCompositions = new ArrayList<>();

    @ToString.Exclude
    @OneToOne(mappedBy = "team")
    private TeamGroup teamGroup;
}
