package com.livekick.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "team")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_team")
    private Long id;

    @NotBlank
    @Size(max = 120)
    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @NotBlank
    @Size(min = 3, max = 3)
    @Column(name = "fifa_code", nullable = false, length = 3, unique = true)
    private String fifaCode;

    @NotBlank
    @Size(max = 120)
    @Column(name = "country", nullable = false, length = 120)
    private String country;

    @Size(max = 500)
    @Column(name = "flag_url", length = 500)
    private String flagUrl;

    @Size(max = 120)
    @Column(name = "coach_name", length = 120)
    private String coachName;

    @Column(name = "world_ranking")
    private Integer worldRanking;
}