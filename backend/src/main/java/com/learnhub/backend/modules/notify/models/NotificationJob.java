package com.learnhub.backend.modules.notify.models;

public record NotificationJob(
        Long userId,
        String title,
        String body,
        String type,
        String referenceType,
        Long referenceId) {
}
