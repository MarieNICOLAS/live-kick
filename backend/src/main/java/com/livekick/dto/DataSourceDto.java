package com.livekick.dto;

import com.livekick.entity.enums.DataSourceType;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DataSourceDto {
    private Long id;
    private String name;
    private DataSourceType sourceType;
    private String baseUrl;
    private Boolean isActive;
    private Instant lastSyncAt;
}
