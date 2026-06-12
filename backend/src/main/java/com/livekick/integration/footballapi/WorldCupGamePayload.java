package com.livekick.integration.footballapi;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record WorldCupGamePayload(
        String id,
        @JsonProperty("home_team_id") String homeTeamId,
        @JsonProperty("away_team_id") String awayTeamId,
        @JsonProperty("home_score") String homeScore,
        @JsonProperty("away_score") String awayScore,
        String group,
        String matchday,
        @JsonProperty("local_date") String localDate,
        @JsonProperty("stadium_id") String stadiumId,
        String finished,
        @JsonProperty("time_elapsed") String timeElapsed,
        String type,
        @JsonProperty("home_team_name_en") String homeTeamNameEn,
        @JsonProperty("away_team_name_en") String awayTeamNameEn,
        @JsonProperty("home_team_label") String homeTeamLabel,
        @JsonProperty("away_team_label") String awayTeamLabel
) {
}