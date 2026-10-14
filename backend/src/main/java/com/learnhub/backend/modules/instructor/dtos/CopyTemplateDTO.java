package com.learnhub.backend.modules.instructor.dtos;

import java.time.LocalDateTime;

public class CopyTemplateDTO {
    private final Long id;
    private final String kind;
    private final String title;
    private final String body;
    private final LocalDateTime updatedAt;

    public CopyTemplateDTO(Long id, String kind, String title, String body, LocalDateTime updatedAt) {
        this.id = id;
        this.kind = kind;
        this.title = title;
        this.body = body;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getKind() {
        return kind;
    }

    public String getTitle() {
        return title;
    }

    public String getBody() {
        return body;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
