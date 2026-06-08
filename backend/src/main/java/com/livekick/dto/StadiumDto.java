package com.livekick.dto;

import java.math.BigDecimal;

public record StadiumDto(
        Long id,
        String name,
        String city,
        String country,
        Integer capacity,
        BigDecimal latitude,
        BigDecimal longitude
) {
}