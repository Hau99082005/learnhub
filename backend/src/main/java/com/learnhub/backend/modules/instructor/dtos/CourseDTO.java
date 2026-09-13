package com.learnhub.backend.modules.instructor.dtos;

import java.time.LocalDateTime;

public class CourseDTO {
    private final Long id;
    private final String title;
    private final String status;
    private final LocalDateTime createdAt;

    public CourseDTO(Long id, String title, String status, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
