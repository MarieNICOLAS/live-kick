package com.livekick.integration.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiPredictionRequest(
        @JsonProperty("match_id") Long matchId,
        @JsonProperty("home_team") TeamContext homeTeam,
        @JsonProperty("away_team") TeamContext awayTeam,
        String stadium
) {
    public record TeamContext(
            String name,
            @JsonProperty("fifa_code") String fifaCode
    ) {
    }
}
