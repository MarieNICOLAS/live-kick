package com.livekick.entity;


import lombok.*;

import jakarta.persistence.*;


@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor
@Builder
@Table(name = "favorite")
@Entity
@NamedQueries({
        @NamedQuery(name = "Favorite::findAll", query = "from Favorite f"),
        @NamedQuery(name = "Favorite::findById", query = "from Favorite f where f.id = ?1"),

})
public class Favorite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TODO: Revoir la structure de cette entité pour permettre d'avoir des favoris de différents types (match, équipe, joueur, etc.)
}
