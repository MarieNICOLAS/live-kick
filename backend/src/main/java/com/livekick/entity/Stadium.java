package com.livekick.entity;

import lombok.*;

import jakarta.persistence.*;


@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor
@Builder
@Table(name = "stadium")
@Entity
@NamedQueries({
        @NamedQuery(name = "Stadium::findAll", query = "from Stadium s"),
        @NamedQuery(name = "Stadium::findById", query = "from Stadium s where s.id = ?1"),

})
public class Stadium {
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
    @ToString.Exclude
    @OneToMany(mappedBy = "stadium")
    @Builder.Default
    private java.util.List<FootballMatch> footballMatches = new java.util.ArrayList<>();
}
