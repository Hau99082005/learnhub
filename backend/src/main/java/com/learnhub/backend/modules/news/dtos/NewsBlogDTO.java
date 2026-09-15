package com.learnhub.backend.modules.news.dtos;

import java.time.LocalDateTime;

public class NewsBlogDTO {
    private final Long id;
    private final String title;
    private final String slug;
    private final String excerpt;
    private final String imageUrl;
    private final Boolean isActive;
    private final LocalDateTime publishedAt;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public NewsBlogDTO(
            Long id,
            String title,
            String slug,
            String excerpt,
            String imageUrl,
            Boolean isActive,
            LocalDateTime publishedAt,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.slug = slug;
        this.excerpt = excerpt;
        this.imageUrl = imageUrl;
        this.isActive = isActive;
        this.publishedAt = publishedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getSlug() {
        return slug;
    }

    public String getExcerpt() {
        return excerpt;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Boolean getIsActive() {
        return isActive;
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
