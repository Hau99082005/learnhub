package com.learnhub.backend.modules.course.dtos;

public class LessonDTO {
    private final Long id;
    private final Long sectionId;
    private final String title;
    private final String slug;
    private final String lessonType;
    private final Integer durationSeconds;
    private final Integer sortOrder;
    private final Boolean isPreview;
    private final Boolean isPublished;
    private final String videoUrl;

    public LessonDTO(
            Long id,
            Long sectionId,
            String title,
            String slug,
            String lessonType,
            Integer durationSeconds,
            Integer sortOrder,
            Boolean isPreview,
            Boolean isPublished,
            String videoUrl) {
        this.id = id;
        this.sectionId = sectionId;
        this.title = title;
        this.slug = slug;
        this.lessonType = lessonType;
        this.durationSeconds = durationSeconds;
        this.sortOrder = sortOrder;
        this.isPreview = isPreview;
        this.isPublished = isPublished;
        this.videoUrl = videoUrl;
    }

    public Long getId() {
        return id;
    }

    public Long getSectionId() {
        return sectionId;
    }

    public String getTitle() {
        return title;
    }

    public String getSlug() {
        return slug;
    }

    public String getLessonType() {
        return lessonType;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public Boolean getIsPreview() {
        return isPreview;
    }

    public Boolean getIsPublished() {
        return isPublished;
    }

    public String getVideoUrl() {
        return videoUrl;
    }
}
