package com.livekick.dto;

import com.livekick.entity.enums.UserRole;

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
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private Boolean emailVerified;
    private UserRole role;
    private Instant registrationDate;
    private Instant lastLoginDate;
    private Instant deletionDate;
    private String avatarUrl;
    private Boolean isActive;
    private Boolean gdprAccepted;
    private Instant gdprAcceptanceDate;
    private String gdprVersionAccepted;
}
