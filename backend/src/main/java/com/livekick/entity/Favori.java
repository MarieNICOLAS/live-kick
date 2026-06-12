package com.livekick.entity;


import lombok.*;

import jakarta.persistence.*;


@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor
@Builder
@Table(name = "favoris")
@Entity
@NamedQueries({
        @NamedQuery(name = "Favori::findAll", query = "from Favori f"),
        @NamedQuery(name = "Favori::findById", query = "from Favori f where f.id = ?1"),

})
public class Favori {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TODO: Revoir la structure de cette entité pour permettre d'avoir des favoris de différents types (match, équipe, joueur, etc.)
}
