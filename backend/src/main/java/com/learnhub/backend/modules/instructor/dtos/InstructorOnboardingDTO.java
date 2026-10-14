package com.learnhub.backend.modules.instructor.dtos;

public class InstructorOnboardingDTO {
    private final Long id;
    private final String teachingFormat;
    private final String recordingExperience;
    private final String audienceSize;
    private final boolean completed;

    public InstructorOnboardingDTO(
            Long id,
            String teachingFormat,
            String recordingExperience,
            String audienceSize,
            boolean completed) {
        this.id = id;
        this.teachingFormat = teachingFormat;
        this.recordingExperience = recordingExperience;
        this.audienceSize = audienceSize;
        this.completed = completed;
    }

    public Long getId() {
        return id;
    }

    public String getTeachingFormat() {
        return teachingFormat;
    }

    public String getRecordingExperience() {
        return recordingExperience;
    }

    public String getAudienceSize() {
        return audienceSize;
    }

    public boolean isCompleted() {
        return completed;
    }
}
