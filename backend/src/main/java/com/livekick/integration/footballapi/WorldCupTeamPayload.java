package com.livekick.integration.footballapi;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record WorldCupTeamPayload(
        String id,
        @JsonProperty("name_en") String nameEn,
        @JsonProperty("fifa_code") String fifaCode,
        String flag,
        String groups
) {
}