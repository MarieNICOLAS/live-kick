package com.livekick.dto;

import java.time.LocalDate;

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
public class CompetitionDto {
    private Long id;
    private String name;
    private Integer year;
    private String hostCountries;
    private LocalDate startDate;
    private LocalDate endDate;
}
