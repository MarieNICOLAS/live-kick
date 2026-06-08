package com.livekick.dto;

import com.livekick.entity.enums.SynchronizationStatus;

import java.time.Instant;

public record ApiSynchronizationDto(
        Long id,
        SynchronizationStatus synchronizationStatus,
        Instant startedAt,
        Instant endedAt,
        String message,
        Integer recordsProcessed,
        Long dataSourceId
) {
}