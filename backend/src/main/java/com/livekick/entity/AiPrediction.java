package com.livekick.entity;

import lombok.*;

import java.time.LocalDate;

import jakarta.persistence.*;


@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor
@Builder
@Table(name = "ai_predictions")
@Entity
@NamedQueries({
        @NamedQuery(name = "AiPrediction::findAll", query = "from AiPrediction ap"),
        @NamedQuery(name = "AiPrediction::findById", query = "from AiPrediction ap where ap.id = ?1"),

})

public class AiPrediction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "probabilite_victoire_domicile", nullable = false)
    private Double probabiliteVictoireDomicile;

    @Column(name = "probabilite_victoire_exterieur", nullable = false)
    private Double probabiliteVictoireExterieur;

    @Column(name = "probabilite_match_nul", nullable = false)
    private Double probabiliteMatchNul;

    @Column(name = "score_Predit_domicile", nullable = false)
    private Integer scorePreditDomicile;

    @Column(name = "score_Predit_exterieur", nullable = false)
    private Integer scorePreditExterieur;

    @Column(name = "confiance_prediction", nullable = false)
    private Double confiancePrediction;

    @Column(name = "explication")
    private String explication;

    @Column(name = "date_prediction", nullable = false)
    private LocalDate datePrediction;

    // Relations
    
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "match_id", nullable = false, unique = true)
    private Match match;
}
