package com.livekick.dto;

import com.livekick.entity.enums.FavoriteType;

import java.time.Instant;

public record FavoriteDto(
        Long id,
        FavoriteType favoriteType,
        Long targetId,
        Instant addedAt,
        Long userId
) {
}