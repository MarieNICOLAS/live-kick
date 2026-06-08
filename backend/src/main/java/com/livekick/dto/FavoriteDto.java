package com.livekick.dto;

import com.livekick.entity.enums.FavoriteType;

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
public class FavoriteDto {
    private Long id;
    private FavoriteType favoriteType;
    private Long targetId;
    private Instant addedAt;
    private Long userId;
}
