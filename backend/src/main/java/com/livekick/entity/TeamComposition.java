package com.livekick.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor
@Builder
@Table(
        name = "team_composition",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_team_composition_team_match", columnNames = {"id_team", "id_football_match"})
        }
)
@Entity
@NamedQueries({
        @NamedQuery(name = "TeamComposition::findAll", query = "from TeamComposition c"),
        @NamedQuery(name = "TeamComposition::findById", query = "from TeamComposition c where c.id = ?1")
})
public class TeamComposition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relations

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_team", nullable = false)
    private Team team;

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_football_match", nullable = false)
    private FootballMatch footballMatch;
}
