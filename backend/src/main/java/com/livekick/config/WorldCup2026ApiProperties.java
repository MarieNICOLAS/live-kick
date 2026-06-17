package com.livekick.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.world-cup-2026-api")
public record WorldCup2026ApiProperties(
        String baseUrl,
        String bearerToken
) {
}