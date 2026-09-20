package com.learnhub.backend.modules.course.dtos;

public class CourseInstructorOptionDTO {
    private final Long id;
    private final String fullName;
    private final String email;

    public CourseInstructorOptionDTO(Long id, String fullName, String email) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }
}
