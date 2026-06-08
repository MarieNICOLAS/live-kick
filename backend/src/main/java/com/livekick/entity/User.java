package com.livekick.entity;

import com.livekick.entity.enums.UserRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "\"user\"")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_user")
    private Long id;

    @NotBlank
    @Size(max = 80)
    @Column(name = "username", nullable = false, length = 80, unique = true)
    private String username;

    @NotBlank
    @Email
    @Size(max = 255)
    @Column(name = "email", nullable = false, length = 255, unique = true)
    private String email;

    @NotNull
    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified;

    @NotBlank
    @Size(max = 255)
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 30)
    private UserRole role;

    @NotNull
    @Column(name = "registration_date", nullable = false)
    private Instant registrationDate;

    @Column(name = "last_login_date")
    private Instant lastLoginDate;

    @Column(name = "deletion_date")
    private Instant deletionDate;

    @Size(max = 500)
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @NotNull
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @NotNull
    @Column(name = "gdpr_accepted", nullable = false)
    private Boolean gdprAccepted;

    @Column(name = "gdpr_acceptance_date")
    private Instant gdprAcceptanceDate;

    @Size(max = 40)
    @Column(name = "gdpr_version_accepted", length = 40)
    private String gdprVersionAccepted;
}