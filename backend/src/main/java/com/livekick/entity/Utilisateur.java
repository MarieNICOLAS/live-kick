package com.livekick.entity;


import lombok.*;

import jakarta.persistence.*;


@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor
@Builder
@Table(name = "utilisateurs")
@Entity
@NamedQueries({
        @NamedQuery(name = "Utilisateur::findAll", query = "from Utilisateur u"),
        @NamedQuery(name = "Utilisateur::findById", query = "from Utilisateur u where u.id = ?1"),

})
public class Utilisateur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pseudo", nullable = false, unique = true)
    private String pseudo;

    @Column(name = "avatar_url")
    private String avatarUrl;

    // Relations
    @OneToOne(mappedBy = "utilisateur", cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = false)
    private PreferenceUtilisateur preferenceUtilisateur;
}
