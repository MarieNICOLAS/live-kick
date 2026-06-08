package com.livekick.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StadiumDto {
    private Long id;
    private String name;
    private String city;
    private String country;
    private Integer capacity;
    private BigDecimal latitude;
    private BigDecimal longitude;
}
