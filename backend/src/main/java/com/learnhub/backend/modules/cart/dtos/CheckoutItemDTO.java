package com.learnhub.backend.modules.cart.dtos;

import java.math.BigDecimal;

public class CheckoutItemDTO {
    private final Long courseId;
    private final String title;
    private final String slug;
    private final String images;
    private final String instructorName;
    private final BigDecimal unitPrice;

    public CheckoutItemDTO(
            Long courseId,
            String title,
            String slug,
            String images,
            String instructorName,
            BigDecimal unitPrice) {
        this.courseId = courseId;
        this.title = title;
        this.slug = slug;
        this.images = images;
        this.instructorName = instructorName;
        this.unitPrice = unitPrice;
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

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }
}
