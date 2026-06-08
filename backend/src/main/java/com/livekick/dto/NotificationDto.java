package com.livekick.dto;

import com.livekick.entity.enums.NotificationType;

import java.time.Instant;

public record NotificationDto(
        Long id,
        String title,
        String message,
        NotificationType notificationType,
        Boolean isRead,
        Instant sentAt,
        Instant readAt,
        String targetLink,
        Long userId
) {
}