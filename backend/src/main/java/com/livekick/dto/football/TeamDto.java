package com.livekick.dto.football;

public record TeamDto(
        Long id,
        String name,
        String fifaCode,
        String country,
        String flagUrl,
        String groupCode
) {
}