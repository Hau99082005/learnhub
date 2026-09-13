package com.learnhub.backend.modules.instructor.dtos;

public class InstructorOnboardingDTO {
    private final Long id;
    private final String teachingFormat;
    private final String recordingExperience;
    private final String audienceSize;

    public InstructorOnboardingDTO(
            Long id,
            String teachingFormat,
            String recordingExperience,
            String audienceSize) {
        this.id = id;
        this.teachingFormat = teachingFormat;
        this.recordingExperience = recordingExperience;
        this.audienceSize = audienceSize;
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
}
