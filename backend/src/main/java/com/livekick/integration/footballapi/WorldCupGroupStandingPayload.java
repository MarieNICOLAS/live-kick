package com.livekick.integration.footballapi;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record WorldCupGroupStandingPayload(
        @JsonProperty("team_id") String teamId,
        String mp,
        String w,
        String l,
        String d,
        String pts,
        String gf,
        String ga,
        String gd
) {
}