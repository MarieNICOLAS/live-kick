package com.livekick.dto;

import com.livekick.entity.enums.DataSourceType;

import java.time.Instant;

public record DataSourceDto(
        Long id,
        String name,
        DataSourceType sourceType,
        String baseUrl,
        Boolean isActive,
        Instant lastSyncAt
) {
}