package com.livekick.entity;


import lombok.*;

import jakarta.persistence.*;


@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor
@Builder
@Table(name = "user_preference")
@Entity
@NamedQueries({
        @NamedQuery(name = "UserPreference::findAll", query = "from UserPreference pu"),
        @NamedQuery(name = "UserPreference::findById", query = "from UserPreference pu where pu.id = ?1"),

})
public class UserPreference {
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
    @ToString.Exclude
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_user", nullable = false, unique = true)
    private User user;
}
