package com.livekick.entity;

import lombok.*;

import jakarta.persistence.*;


@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor
@Builder
@Table(name = "stades")
@Entity
@NamedQueries({
        @NamedQuery(name = "Stade::findAll", query = "from Stade s"),
        @NamedQuery(name = "Stade::findById", query = "from Stade s where s.id = ?1"),

})
public class Stade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "ville", nullable = false)
    private String ville;

    @Column(name = "pays", nullable = false)
    private String pays;

    @Column(name = "capacite")
    private Integer capacite;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    // Relations
    @OneToMany(mappedBy = "stade")
    @Builder.Default
    private java.util.List<Match> matchs = new java.util.ArrayList<>();
}
