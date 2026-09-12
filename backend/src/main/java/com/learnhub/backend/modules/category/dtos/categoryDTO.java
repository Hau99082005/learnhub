package com.learnhub.backend.modules.category.dtos;

import java.time.LocalDateTime;

public class categoryDTO {
    private final Long id;
    private final String name;
    private final String slug;
    private final String images;
    private final Boolean status;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public categoryDTO(
            Long id,
            String name,
            String slug,
            String images,
            Boolean status,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.images = images;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSlug() {
        return slug;
    }

    public String getImages() {
        return images;
    }

    public Boolean getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
