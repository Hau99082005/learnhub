package com.learnhub.backend.modules.ai.dtos;

import java.math.BigDecimal;

public class AiCourseCardDTO {
    private final String title;
    private final String slug;
    private final String images;
    private final String instructor;
    private final String level;
    private final String category;
    private final BigDecimal price;
    private final String currency;
    private final boolean free;

    public AiCourseCardDTO(
            String title,
            String slug,
            String images,
            String instructor,
            String level,
            String category,
            BigDecimal price,
            String currency,
            boolean free) {
        this.title = title;
        this.slug = slug;
        this.images = images;
        this.instructor = instructor;
        this.level = level;
        this.category = category;
        this.price = price;
        this.currency = currency;
        this.free = free;
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

    public String getInstructor() {
        return instructor;
    }

    public String getLevel() {
        return level;
    }

    public String getCategory() {
        return category;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getCurrency() {
        return currency;
    }

    public boolean isFree() {
        return free;
    }
}
