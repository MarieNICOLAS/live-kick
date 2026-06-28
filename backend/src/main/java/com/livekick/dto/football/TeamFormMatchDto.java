package com.livekick.dto.football;

import java.time.LocalDateTime;

public record TeamFormMatchDto(
        Long matchId,
        LocalDateTime matchDate,
        TeamSummaryDto opponent,
        Boolean home,
        Integer teamScore,
        Integer opponentScore,
        String result
        ) {
}
