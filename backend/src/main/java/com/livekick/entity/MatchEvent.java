package com.livekick.entity;


import com.livekick.Enum.TypeEvenement;

import lombok.*;

import jakarta.persistence.*;


@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor
@Builder
@Table(name = "match_event")
@Entity
@NamedQueries({
        @NamedQuery(name = "MatchEvent::findAll", query = "from MatchEvent em"),
        @NamedQuery(name = "MatchEvent::findById", query = "from MatchEvent em where em.id = ?1"),

})
public class MatchEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "type_evenement", nullable = false)
    @Enumerated(EnumType.STRING)
    private TypeEvenement typeEvenement;

    @Column(name = "minute", nullable = false)
    private Integer minute;

    @Column(name = "description")
    private String description;

    // Relations

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_football_match", nullable = false)
    private FootballMatch footballMatch;

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_player")
    private Player player;
}
