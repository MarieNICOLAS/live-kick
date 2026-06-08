package com.livekick.dto;

import com.livekick.entity.enums.Theme;

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
public class UserPreferenceDto {
    private Long id;
    private String language;
    private Theme theme;
    private Boolean notificationsEnabled;
    private Long userId;
}
