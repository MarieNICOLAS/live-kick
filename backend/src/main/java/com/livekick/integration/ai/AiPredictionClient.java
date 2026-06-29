package com.livekick.integration.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.livekick.config.AiServiceProperties;
import com.livekick.dto.ai.PredictionDto;
import com.livekick.exception.ExternalServiceException;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

@Component
public class AiPredictionClient {

    private final ObjectMapper objectMapper;
    private final URI predictUri;
    private final HttpClient httpClient;

    public AiPredictionClient(AiServiceProperties properties, ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.predictUri = URI.create(properties.baseUrl()).resolve("/predict");
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .version(HttpClient.Version.HTTP_1_1)
                .build();
    }

    public PredictionDto predict(AiPredictionRequest request) {
        try {
            HttpRequest httpRequest = HttpRequest.newBuilder(predictUri)
                    .timeout(Duration.ofSeconds(90))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(toJson(request)))
                    .build();

            HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (httpResponse.statusCode() < 200 || httpResponse.statusCode() >= 300) {
                throw new ExternalServiceException(
                        "AI service returned HTTP " + httpResponse.statusCode() + ": " + sanitize(httpResponse.body())
                );
            }

            AiPredictionResponse response = objectMapper.readValue(httpResponse.body(), AiPredictionResponse.class);

            if (response == null) {
                throw new ExternalServiceException("AI service returned an empty prediction response");
            }

            return response.toPredictionDto();
        } catch (JsonProcessingException exception) {
            throw new ExternalServiceException("AI service returned an unreadable JSON response", exception);
        } catch (IOException exception) {
            throw new ExternalServiceException("AI service is unavailable: " + exception.getMessage(), exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ExternalServiceException("AI service call was interrupted", exception);
        }
    }

    private String toJson(AiPredictionRequest request) throws JsonProcessingException {
        return objectMapper.writeValueAsString(Map.of(
                "match_id", request.matchId(),
                "home_team", Map.of(
                        "name", request.homeTeam().name(),
                        "fifa_code", request.homeTeam().fifaCode()
                ),
                "away_team", Map.of(
                        "name", request.awayTeam().name(),
                        "fifa_code", request.awayTeam().fifaCode()
                ),
                "stadium", request.stadium()
        ));
    }

    private String sanitize(String message) {
        if (message == null || message.isBlank()) {
            return "empty response body";
        }
        return message.length() > 300 ? message.substring(0, 300) : message;
    }
}
