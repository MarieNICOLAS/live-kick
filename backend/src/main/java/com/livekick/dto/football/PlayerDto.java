package com.livekick.dto.football;

import java.time.LocalDate;

public record PlayerDto(
        Long id,
        Long teamId,
        String firstName,
        String lastName,
        String position,
        Integer shirtNumber,
        String nationality,
        String photoUrl,
        LocalDate birthDate
) {
}
