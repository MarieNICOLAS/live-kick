package com.livekick.entity;


import lombok.*;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;


@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor
@Builder
@Table(name = "competition_group")
@Entity
@NamedQueries({
        @NamedQuery(name = "CompetitionGroup::findAll", query = "from CompetitionGroup g"),
        @NamedQuery(name = "CompetitionGroup::findById", query = "from CompetitionGroup g where g.id = ?1"),

})
public class CompetitionGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name= "code_groupe", nullable = false)
    private String codeGroupe; // A, B, C...

    @ToString.Exclude
    @OneToMany(mappedBy = "competitionGroup")
    @Builder.Default
    private List<TeamGroup> teamGroups = new ArrayList<>();
}
