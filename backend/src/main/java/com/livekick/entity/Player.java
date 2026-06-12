package com.livekick.entity;


import com.livekick.Enum.PosteJoueur;
import lombok.*;

import jakarta.persistence.*;
import java.time.LocalDate;


@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor
@Builder
@Table(name = "player")
@Entity
@NamedQueries({
        @NamedQuery(name = "Player::findAll", query = "from Player j"),
        @NamedQuery(name = "Player::findById", query = "from Player j where j.id = ?1"),

})
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "prenom", nullable = false)
    private String prenom;

    @Column(name = "poste")
    @Enumerated(EnumType.STRING)
    private PosteJoueur poste;

    @Column(name = "numero_maillot", nullable = false)
    private Integer numeroMaillot;

    @Column(name="nationalite")
    private String nationalite;

    @Column(name="photo_url")
    private String photoUrl;

    @Column(name="date_naissance")
    private LocalDate dateNaissance;

    // Relations
    
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_team", nullable = false)
    private Team team;
}
