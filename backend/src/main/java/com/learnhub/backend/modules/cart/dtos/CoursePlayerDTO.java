package com.learnhub.backend.modules.cart.dtos;

import java.math.BigDecimal;
import java.util.List;

import com.learnhub.backend.modules.course.dtos.CourseSectionDTO;

public class CoursePlayerDTO {
    private final Long courseId;
    private final Long enrollmentId;
    private final String title;
    private final String slug;
    private final String subtitle;
    private final String description;
    private final String images;
    private final String instructorName;
    private final Integer durationSeconds;
    private final BigDecimal progressPercent;
    private final Boolean issuesCertificate;
    private final String certificateCode;
    private final String grade;
    private final String gradeLabel;
    private final List<CourseSectionDTO> sections;

    public CoursePlayerDTO(
            Long courseId,
            Long enrollmentId,
            String title,
            String slug,
            String subtitle,
            String description,
            String images,
            String instructorName,
            Integer durationSeconds,
            BigDecimal progressPercent,
            Boolean issuesCertificate,
            String certificateCode,
            String grade,
            String gradeLabel,
            List<CourseSectionDTO> sections) {
        this.courseId = courseId;
        this.enrollmentId = enrollmentId;
        this.title = title;
        this.slug = slug;
        this.subtitle = subtitle;
        this.description = description;
        this.images = images;
        this.instructorName = instructorName;
        this.durationSeconds = durationSeconds;
        this.progressPercent = progressPercent;
        this.issuesCertificate = issuesCertificate;
        this.certificateCode = certificateCode;
        this.grade = grade;
        this.gradeLabel = gradeLabel;
        this.sections = sections;
    }

    public Long getCourseId() {
        return courseId;
    }

    public Long getEnrollmentId() {
        return enrollmentId;
    }

    public String getTitle() {
        return title;
    }

    public String getSlug() {
        return slug;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public String getDescription() {
        return description;
    }

    public String getImages() {
        return images;
    }

    public String getInstructorName() {
        return instructorName;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public BigDecimal getProgressPercent() {
        return progressPercent;
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

    public List<CourseSectionDTO> getSections() {
        return sections;
    }
}
