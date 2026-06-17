package com.livekick.integration.footballapi;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record WorldCupGroupsResponse(List<WorldCupGroupPayload> groups) {
}