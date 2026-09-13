package com.learnhub.backend.modules.instructor.dtos;

public class InstructorOnboardingRequest {
    private String teachingFormat;
    private String recordingExperience;
    private String audienceSize;

    public String getTeachingFormat() {
        return teachingFormat;
    }

    public void setTeachingFormat(String teachingFormat) {
        this.teachingFormat = teachingFormat;
    }

    public String getRecordingExperience() {
        return recordingExperience;
    }

    public void setRecordingExperience(String recordingExperience) {
        this.recordingExperience = recordingExperience;
    }

    public String getAudienceSize() {
        return audienceSize;
    }

    public void setAudienceSize(String audienceSize) {
        this.audienceSize = audienceSize;
    }
}
