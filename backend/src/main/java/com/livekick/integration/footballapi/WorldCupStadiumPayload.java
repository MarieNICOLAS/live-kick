package com.livekick.integration.footballapi;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record WorldCupStadiumPayload(
        String id,
        @JsonProperty("name_en") String nameEn,
        @JsonProperty("fifa_name") String fifaName,
        @JsonProperty("city_en") String cityEn,
        @JsonProperty("country_en") String countryEn,
        Integer capacity,
        String region
) {
}