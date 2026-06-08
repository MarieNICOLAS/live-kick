package com.livekick.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class IntegrationConfig {

    @Bean
    RestClient aiServiceRestClient(RestClient.Builder builder, AiServiceProperties properties) {
        return builder
                .baseUrl(properties.baseUrl())
                .build();
    }
}
