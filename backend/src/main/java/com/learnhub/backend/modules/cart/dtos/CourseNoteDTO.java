package com.learnhub.backend.modules.cart.dtos;

import java.time.LocalDateTime;

public class CourseNoteDTO {
    private final Long id;
    private final Long courseId;
    private final Long lessonId;
    private final String body;
    private final Integer timestampSeconds;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public CourseNoteDTO(
            Long id,
            Long courseId,
            Long lessonId,
            String body,
            Integer timestampSeconds,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.id = id;
        this.courseId = courseId;
        this.lessonId = lessonId;
        this.body = body;
        this.timestampSeconds = timestampSeconds;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public Long getLessonId() {
        return lessonId;
    }

    public String getBody() {
        return body;
    }

    public Integer getTimestampSeconds() {
        return timestampSeconds;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
