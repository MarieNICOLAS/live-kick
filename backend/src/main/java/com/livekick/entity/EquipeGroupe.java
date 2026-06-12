package com.livekick.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor
@Builder
@Table(name = "equipe_groupes")
@Entity
@NamedQueries({
        @NamedQuery(name = "EquipeGroupe::findAll", query = "from EquipeGroupe eg"),
        @NamedQuery(name = "EquipeGroupe::findById", query = "from EquipeGroupe eg where eg.id = ?1")
})
public class EquipeGroupe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "points", nullable = false)
    @Builder.Default
    private Integer points = 0;

    @Column(name = "victoires", nullable = false)
    @Builder.Default
    private Integer victoires = 0;

    @Column(name = "nuls", nullable = false)
    @Builder.Default
    private Integer nuls = 0;

    @Column(name = "defaites", nullable = false)
    @Builder.Default
    private Integer defaites = 0;

    @Column(name = "buts_pour", nullable = false)
    @Builder.Default
    private Integer butsPour = 0;

    @Column(name = "buts_contres", nullable = false)
    @Builder.Default
    private Integer butsContres = 0;

    @Column(name = "differences_buts", nullable = false)
    @Builder.Default
    private Integer differencesButs = 0;

    @Column(name = "classement")
    private Integer classement;

    @Column(name = "date_mise_a_jour")
    private LocalDateTime dateMiseAJour;
    
    // Liaisons
    
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_equipe", nullable = false, unique = true)
    private Equipe equipe;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_groupe", nullable = false)
    private Groupe groupe;
}
