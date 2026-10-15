package com.learnhub.backend.modules.cart.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class LearningItemDTO {
    private final Long enrollmentId;
    private final Long courseId;
    private final String title;
    private final String slug;
    private final String images;
    private final String instructorName;
    private final Long instructorId;
    private final Long categoryId;
    private final String categoryName;
    private final Integer durationSeconds;
    private final String level;
    private final BigDecimal progressPercent;
    private final String status;
    private final String source;
    private final Boolean issuesCertificate;
    private final String certificateCode;
    private final String grade;
    private final String gradeLabel;
    private final LocalDateTime enrolledAt;
    private final LocalDateTime completedAt;

    public LearningItemDTO(
            Long enrollmentId,
            Long courseId,
            String title,
            String slug,
            String images,
            String instructorName,
            Long instructorId,
            Long categoryId,
            String categoryName,
            Integer durationSeconds,
            String level,
            BigDecimal progressPercent,
            String status,
            String source,
            Boolean issuesCertificate,
            String certificateCode,
            String grade,
            String gradeLabel,
            LocalDateTime enrolledAt,
            LocalDateTime completedAt) {
        this.enrollmentId = enrollmentId;
        this.courseId = courseId;
        this.title = title;
        this.slug = slug;
        this.images = images;
        this.instructorName = instructorName;
        this.instructorId = instructorId;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.durationSeconds = durationSeconds;
        this.level = level;
        this.progressPercent = progressPercent;
        this.status = status;
        this.source = source;
        this.issuesCertificate = issuesCertificate;
        this.certificateCode = certificateCode;
        this.grade = grade;
        this.gradeLabel = gradeLabel;
        this.enrolledAt = enrolledAt;
        this.completedAt = completedAt;
    }

    public Long getEnrollmentId() {
        return enrollmentId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public String getTitle() {
        return title;
    }

    public String getSlug() {
        return slug;
    }

    public String getImages() {
        return images;
    }

    public String getInstructorName() {
        return instructorName;
    }

    public Long getInstructorId() {
        return instructorId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public String getLevel() {
        return level;
    }

    public BigDecimal getProgressPercent() {
        return progressPercent;
    }

    public String getStatus() {
        return status;
    }

    public String getSource() {
        return source;
    }

    public Boolean getIssuesCertificate() {
        return issuesCertificate;
    }

    public String getCertificateCode() {
        return certificateCode;
    }

    public String getGrade() {
        return grade;
    }

    public String getGradeLabel() {
        return gradeLabel;
    }

    public LocalDateTime getEnrolledAt() {
        return enrolledAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
}
