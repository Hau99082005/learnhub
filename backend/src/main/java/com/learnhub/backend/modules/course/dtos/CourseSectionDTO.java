package com.learnhub.backend.modules.course.dtos;

import java.util.List;

public class CourseSectionDTO {
    private final Long id;
    private final String title;
    private final String description;
    private final Integer sortOrder;
    private final Integer lessonCount;
    private final Integer durationSeconds;
    private final List<LessonDTO> lessons;

    public CourseSectionDTO(
            Long id,
            String title,
            String description,
            Integer sortOrder,
            Integer lessonCount,
            Integer durationSeconds,
            List<LessonDTO> lessons) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.sortOrder = sortOrder;
        this.lessonCount = lessonCount;
        this.durationSeconds = durationSeconds;
        this.lessons = lessons;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public Integer getLessonCount() {
        return lessonCount;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public List<LessonDTO> getLessons() {
        return lessons;
    }
}
