package com.learnhub.backend.modules.cart.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CertificateDTO {
    private final Long id;
    private final String code;
    private final Long enrollmentId;
    private final Long courseId;
    private final String slug;
    private final String courseTitle;
    private final String images;
    private final String learnerName;
    private final String instructorName;
    private final BigDecimal watchPercent;
    private final String grade;
    private final String gradeLabel;
    private final LocalDateTime issuedAt;
    private final LocalDateTime enrolledAt;

    public CertificateDTO(
            Long id,
            String code,
            Long enrollmentId,
            Long courseId,
            String slug,
            String courseTitle,
            String images,
            String learnerName,
            String instructorName,
            BigDecimal watchPercent,
            String grade,
            String gradeLabel,
            LocalDateTime issuedAt,
            LocalDateTime enrolledAt) {
        this.id = id;
        this.code = code;
        this.enrollmentId = enrollmentId;
        this.courseId = courseId;
        this.slug = slug;
        this.courseTitle = courseTitle;
        this.images = images;
        this.learnerName = learnerName;
        this.instructorName = instructorName;
        this.watchPercent = watchPercent;
        this.grade = grade;
        this.gradeLabel = gradeLabel;
        this.issuedAt = issuedAt;
        this.enrolledAt = enrolledAt;
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public Long getEnrollmentId() {
        return enrollmentId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public String getSlug() {
        return slug;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public String getImages() {
        return images;
    }

    public String getLearnerName() {
        return learnerName;
    }

    public String getInstructorName() {
        return instructorName;
    }

    public BigDecimal getWatchPercent() {
        return watchPercent;
    }

    public String getGrade() {
        return grade;
    }

    public String getGradeLabel() {
        return gradeLabel;
    }

    public LocalDateTime getIssuedAt() {
        return issuedAt;
    }

    public LocalDateTime getEnrolledAt() {
        return enrolledAt;
    }
}
