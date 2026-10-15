package com.learnhub.backend.modules.cart.dtos;

public class CourseNoteRequest {
    private Long lessonId;
    private String body;
    private Integer timestampSeconds;

    public Long getLessonId() {
        return lessonId;
    }

    public void setLessonId(Long lessonId) {
        this.lessonId = lessonId;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public Integer getTimestampSeconds() {
        return timestampSeconds;
    }

    public void setTimestampSeconds(Integer timestampSeconds) {
        this.timestampSeconds = timestampSeconds;
    }
}
