package com.livekick.controller;

import com.livekick.config.AiServiceProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api/v1/status")
public class StatusController {

    private final String applicationName;
    private final AiServiceProperties aiServiceProperties;

    public StatusController(
            @Value("${spring.application.name}") String applicationName,
            AiServiceProperties aiServiceProperties
    ) {
        this.applicationName = applicationName;
        this.aiServiceProperties = aiServiceProperties;
    }

    @GetMapping
    public StatusResponse getStatus() {
        return new StatusResponse(
                applicationName,
                "UP",
                "v1",
                aiServiceProperties.baseUrl(),
                Instant.now()
        );
    }

    public record StatusResponse(
            String application,
            String status,
            String apiVersion,
            String aiServiceBaseUrl,
            Instant timestamp
    ) {
    }
}
