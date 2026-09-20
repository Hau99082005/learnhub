package com.learnhub.backend.modules.course.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class CourseAdminDTO {
    private final Long id;
    private final Long instructorId;
    private final String instructorName;
    private final Long categoryId;
    private final String categoryName;
    private final String images;
    private final String previewVideo;
    private final String title;
    private final String slug;
    private final String subtitle;
    private final String description;
    private final String language;
    private final String level;
    private final String status;
    private final BigDecimal price;
    private final BigDecimal compareAtPrice;
    private final String currency;
    private final Boolean isFree;
    private final Boolean issuesCertificate;
    private final Integer durationSeconds;
    private final Integer enrolledCount;
    private final BigDecimal ratingAvg;
    private final Integer ratingCount;
    private final List<String> whatYouWillLearn;
    private final List<String> requirements;
    private final LocalDateTime publishedAt;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public CourseAdminDTO(
            Long id,
            Long instructorId,
            String instructorName,
            Long categoryId,
            String categoryName,
            String images,
            String previewVideo,
            String title,
            String slug,
            String subtitle,
            String description,
            String language,
            String level,
            String status,
            BigDecimal price,
            BigDecimal compareAtPrice,
            String currency,
            Boolean isFree,
            Boolean issuesCertificate,
            Integer durationSeconds,
            Integer enrolledCount,
            BigDecimal ratingAvg,
            Integer ratingCount,
            List<String> whatYouWillLearn,
            List<String> requirements,
            LocalDateTime publishedAt,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.id = id;
        this.instructorId = instructorId;
        this.instructorName = instructorName;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.images = images;
        this.previewVideo = previewVideo;
        this.title = title;
        this.slug = slug;
        this.subtitle = subtitle;
        this.description = description;
        this.language = language;
        this.level = level;
        this.status = status;
        this.price = price;
        this.compareAtPrice = compareAtPrice;
        this.currency = currency;
        this.isFree = isFree;
        this.issuesCertificate = issuesCertificate;
        this.durationSeconds = durationSeconds;
        this.enrolledCount = enrolledCount;
        this.ratingAvg = ratingAvg;
        this.ratingCount = ratingCount;
        this.whatYouWillLearn = whatYouWillLearn;
        this.requirements = requirements;
        this.publishedAt = publishedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getInstructorId() {
        return instructorId;
    }

    public String getInstructorName() {
        return instructorName;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public String getImages() {
        return images;
    }

    public String getPreviewVideo() {
        return previewVideo;
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

    public String getLanguage() {
        return language;
    }

    public String getLevel() {
        return level;
    }

    public String getStatus() {
        return status;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public BigDecimal getCompareAtPrice() {
        return compareAtPrice;
    }

    public String getCurrency() {
        return currency;
    }

    public Boolean getIsFree() {
        return isFree;
    }

    public Boolean getIssuesCertificate() {
        return issuesCertificate;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public Integer getEnrolledCount() {
        return enrolledCount;
    }

    public BigDecimal getRatingAvg() {
        return ratingAvg;
    }

    public Integer getRatingCount() {
        return ratingCount;
    }

    public List<String> getWhatYouWillLearn() {
        return whatYouWillLearn;
    }

    public List<String> getRequirements() {
        return requirements;
    }

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
