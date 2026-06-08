package com.livekick.dto;

import com.livekick.entity.enums.NotificationType;

import java.time.Instant;

public class NotificationDto {
    private Long id;
    private String title;
    private String message;
    private NotificationType notificationType;
    private Boolean isRead;
    private Instant sentAt;
    private Instant readAt;
    private String targetLink;
    private Long userId;
}
