package com.livekick.entity;


import lombok.*;

import jakarta.persistence.*;


@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor
@Builder
@Table(name = "preference_utilisateur")
@Entity
@NamedQueries({
        @NamedQuery(name = "PreferenceUtilisateur::findAll", query = "from PreferenceUtilisateur pu"),
        @NamedQuery(name = "PreferenceUtilisateur::findById", query = "from PreferenceUtilisateur pu where pu.id = ?1"),

})
public class PreferenceUtilisateur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "langue", nullable = false)
    private String langue;

    @Column(name = "theme", nullable = false)
    private String theme;

    @Column(name = "fuseau_horaire", nullable = false)
    private String fuseauHoraire;

    // Relations
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false, unique = true)
    private Utilisateur utilisateur;
}
