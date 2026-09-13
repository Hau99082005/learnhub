package com.learnhub.backend.modules.user.dtos;

public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String confirmPassword;
    private String role;
    private String teachingFormat;
    private String recordingExperience;
    private String audienceSize;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

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
