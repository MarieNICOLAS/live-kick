package com.livekick.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "stadium")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Stadium {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_stadium")
    private Long id;

    @NotBlank
    @Size(max = 160)
    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @NotBlank
    @Size(max = 120)
    @Column(name = "city", nullable = false, length = 120)
    private String city;

    @NotBlank
    @Size(max = 120)
    @Column(name = "country", nullable = false, length = 120)
    private String country;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "latitude", precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 9, scale = 6)
    private BigDecimal longitude;
}