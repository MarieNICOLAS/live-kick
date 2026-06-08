package com.livekick.dto;

import com.livekick.entity.enums.PlayerPosition;

import java.time.LocalDate;

public record PlayerDto(
        Long id,
        String firstName,
        String lastName,
        LocalDate birthDate,
        PlayerPosition position,
        Integer shirtNumber,
        String photoUrl,
        Long teamId
) {
}