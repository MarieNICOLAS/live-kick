package com.livekick.entity;


import lombok.*;

import jakarta.persistence.*;


@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor
@Builder
@Table(name = "user")
@Entity
@NamedQueries({
        @NamedQuery(name = "User::findAll", query = "from User u"),
        @NamedQuery(name = "User::findById", query = "from User u where u.id = ?1"),

})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pseudo", nullable = false, unique = true)
    private String pseudo;

    @Column(name = "avatar_url")
    private String avatarUrl;

    // Relations
    @ToString.Exclude
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = false)
    private UserPreference userPreference;
}
