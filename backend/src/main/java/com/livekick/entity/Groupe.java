package com.livekick.entity;


import lombok.*;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;


@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor
@Builder
@Table(name = "groupes")
@Entity
@NamedQueries({
        @NamedQuery(name = "Groupe::findAll", query = "from Groupe g"),
        @NamedQuery(name = "Groupe::findById", query = "from Groupe g where g.id = ?1"),

})
public class Groupe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name= "code_groupe", nullable = false)
    private String codeGroupe; // A, B, C...

    @ToString.Exclude
    @OneToMany(mappedBy = "groupe")
    @Builder.Default
    private List<EquipeGroupe> equipesGroupe = new ArrayList<>();
}
