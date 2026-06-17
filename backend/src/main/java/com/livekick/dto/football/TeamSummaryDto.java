package com.livekick.dto.football;

public record TeamSummaryDto(
        Long id,
        String name,
        String fifaCode,
        String flagUrl
) {
}