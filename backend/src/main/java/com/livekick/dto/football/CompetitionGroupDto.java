package com.livekick.dto.football;

import java.util.List;

public record CompetitionGroupDto(
        String code,
        Integer displayOrder,
        List<GroupStandingDto> standings
) {
}