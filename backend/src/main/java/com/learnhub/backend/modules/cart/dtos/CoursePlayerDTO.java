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

    public List<CourseSectionDTO> getSections() {
        return sections;
    }
}
