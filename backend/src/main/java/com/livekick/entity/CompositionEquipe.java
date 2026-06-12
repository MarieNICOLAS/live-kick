package com.livekick.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor
@Builder
@Table(name = "composition_equipes")
@Entity
@NamedQueries({
        @NamedQuery(name = "CompositionEquipe::findAll", query = "from CompositionEquipe c"),
        @NamedQuery(name = "CompositionEquipe::findById", query = "from CompositionEquipe c where c.id = ?1")
})
public class CompositionEquipe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relations

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipe_id", nullable = false)
    private Equipe equipe;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;
}
