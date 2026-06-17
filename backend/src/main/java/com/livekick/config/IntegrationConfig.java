package com.livekick.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestClient;

import java.util.Optional;

@Configuration
public class IntegrationConfig {

    @Bean
    @Qualifier("aiServiceRestClient")
    RestClient aiServiceRestClient(RestClient.Builder builder, AiServiceProperties properties) {
        return builder
                .baseUrl(properties.baseUrl())
                .build();
    }

    @Bean
    @Qualifier("worldCup2026RestClient")
    RestClient worldCup2026RestClient(RestClient.Builder builder, WorldCup2026ApiProperties properties) {
        RestClient.Builder restClientBuilder = builder.baseUrl(properties.baseUrl());
        Optional.ofNullable(properties.bearerToken())
                .filter(token -> !token.isBlank())
                .ifPresent(token -> restClientBuilder.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token));
        return restClientBuilder.build();
    }
}
