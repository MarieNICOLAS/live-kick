package com.livekick.dto;

import java.time.LocalDate;

public record CompetitionDto(
        Long id,
        String name,
        Integer year,
        String hostCountries,
        LocalDate startDate,
        LocalDate endDate
) {
}