package com.learnhub.backend.modules.instructor.models;

import java.time.LocalDateTime;

import com.learnhub.backend.modules.user.models.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity(name = "InstructorOnboarding")
@Table(name = "instructor_onboarding")
public class InstructorOnboarding {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private user user;

    @Column(name = "teaching_format", nullable = false, length = 64)
    private String teachingFormat;

    @Column(name = "recording_experience", nullable = false, length = 64)
    private String recordingExperience;

    @Column(name = "audience_size", nullable = false, length = 64)
    private String audienceSize;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public user getUser() {
        return user;
    }

    public void setUser(user user) {
        this.user = user;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
