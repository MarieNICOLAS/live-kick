package com.livekick.dto;

import com.livekick.entity.enums.Theme;

public record UserPreferenceDto(
        Long id,
        String language,
        Theme theme,
        Boolean notificationsEnabled,
        Long userId
) {
}