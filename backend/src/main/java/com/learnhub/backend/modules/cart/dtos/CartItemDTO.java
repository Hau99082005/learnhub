package com.learnhub.backend.modules.cart.dtos;

import java.math.BigDecimal;

public class CartItemDTO {
    private final Long id;
    private final Long courseId;
    private final String title;
    private final String slug;
    private final String images;
    private final String instructorName;
    private final BigDecimal unitPrice;
    private final BigDecimal price;
    private final BigDecimal compareAtPrice;
    private final String currency;
    private final Boolean isFree;
    private final Integer durationSeconds;
    private final BigDecimal ratingAvg;
    private final Integer ratingCount;

    public CartItemDTO(
            Long id,
            Long courseId,
            String title,
            String slug,
            String images,
            String instructorName,
            BigDecimal unitPrice,
            BigDecimal price,
            BigDecimal compareAtPrice,
            String currency,
            Boolean isFree,
            Integer durationSeconds,
            BigDecimal ratingAvg,
            Integer ratingCount) {
        this.id = id;
        this.courseId = courseId;
        this.title = title;
        this.slug = slug;
        this.images = images;
        this.instructorName = instructorName;
        this.unitPrice = unitPrice;
        this.price = price;
        this.compareAtPrice = compareAtPrice;
        this.currency = currency;
        this.isFree = isFree;
        this.durationSeconds = durationSeconds;
        this.ratingAvg = ratingAvg;
        this.ratingCount = ratingCount;
    }

    public Long getId() {
        return id;
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

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public BigDecimal getRatingAvg() {
        return ratingAvg;
    }

    public Integer getRatingCount() {
        return ratingCount;
    }
}
