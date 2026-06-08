package com.livekick.dto;

import com.livekick.entity.enums.UserRole;

import java.time.Instant;

public record UserDto(
        Long id,
        String username,
        String email,
        Boolean emailVerified,
        UserRole role,
        Instant registrationDate,
        Instant lastLoginDate,
        Instant deletionDate,
        String avatarUrl,
        Boolean isActive,
        Boolean gdprAccepted,
        Instant gdprAcceptanceDate,
        String gdprVersionAccepted
) {
}