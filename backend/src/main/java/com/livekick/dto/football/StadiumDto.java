package com.livekick.dto.football;

public record StadiumDto(
        Long id,
        String name,
        String fifaName,
        String city,
        String country,
        Integer capacity,
        String region
) {
}