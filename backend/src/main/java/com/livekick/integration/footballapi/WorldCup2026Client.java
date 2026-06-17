package com.livekick.integration.footballapi;

import com.livekick.exception.ExternalServiceException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Optional;

@Component
public class WorldCup2026Client {

    private final RestClient restClient;

    public WorldCup2026Client(@Qualifier("worldCup2026RestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    public List<WorldCupTeamPayload> getTeams() {
        return get("/get/teams", WorldCupTeamsResponse.class)
                .map(WorldCupTeamsResponse::teams)
                .orElse(List.of());
    }

    public List<WorldCupGamePayload> getGames() {
        return get("/get/games", WorldCupGamesResponse.class)
                .map(WorldCupGamesResponse::games)
                .orElse(List.of());
    }

    public List<WorldCupGroupPayload> getGroups() {
        return get("/get/groups", WorldCupGroupsResponse.class)
                .map(WorldCupGroupsResponse::groups)
                .orElse(List.of());
    }

    public List<WorldCupStadiumPayload> getStadiums() {
        return get("/get/stadiums", WorldCupStadiumsResponse.class)
                .map(WorldCupStadiumsResponse::stadiums)
                .orElse(List.of());
    }

    private <T> Optional<T> get(String path, Class<T> responseType) {
        try {
            return Optional.ofNullable(restClient.get()
                    .uri(path)
                    .retrieve()
                    .body(responseType));
        } catch (RestClientException exception) {
            throw new ExternalServiceException("World Cup 2026 data provider is unavailable");
        }
    }
}