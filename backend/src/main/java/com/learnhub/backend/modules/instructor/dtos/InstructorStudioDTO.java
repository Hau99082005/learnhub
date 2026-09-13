package com.learnhub.backend.modules.instructor.dtos;

import java.util.List;

import com.learnhub.backend.modules.user.dtos.userDTO;

public class InstructorStudioDTO {
    private final userDTO user;
    private final InstructorOnboardingDTO onboarding;
    private final List<CourseDTO> courses;

    public InstructorStudioDTO(
            userDTO user,
            InstructorOnboardingDTO onboarding,
            List<CourseDTO> courses) {
        this.user = user;
        this.onboarding = onboarding;
        this.courses = courses;
    }

    public userDTO getUser() {
        return user;
    }

    public InstructorOnboardingDTO getOnboarding() {
        return onboarding;
    }

    public List<CourseDTO> getCourses() {
        return courses;
    }
}
