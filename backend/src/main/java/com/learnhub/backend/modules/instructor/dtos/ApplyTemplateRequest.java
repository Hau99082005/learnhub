package com.learnhub.backend.modules.instructor.dtos;

public class ApplyTemplateRequest {
    private Long courseId;

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }
}
