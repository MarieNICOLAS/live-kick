package com.livekick.dto;

import com.livekick.entity.enums.SynchronizationStatus;

import java.time.Instant;

public class ApiSynchronizationDto {
    private Long id;
    private SynchronizationStatus synchronizationStatus;
    private Instant startedAt;
    private Instant endedAt;
    private String message;
    private Integer recordsProcessed;
    private Long dataSourceId;
}
