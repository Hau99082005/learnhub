package com.learnhub.backend.modules.instructor.dtos;

import java.time.LocalDateTime;

public class SupportTicketDTO {
    private final Long id;
    private final String topic;
    private final String title;
    private final String body;
    private final String status;
    private final LocalDateTime createdAt;

    public SupportTicketDTO(
            Long id,
            String topic,
            String title,
            String body,
            String status,
            LocalDateTime createdAt) {
        this.id = id;
        this.topic = topic;
        this.title = title;
        this.body = body;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getTopic() {
        return topic;
    }

    public String getTitle() {
        return title;
    }

    public String getBody() {
        return body;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
