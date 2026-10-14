package com.learnhub.backend.modules.instructor.dtos;

import java.math.BigDecimal;

public class PerformanceCourseDTO {
    private final Long id;
    private final String title;
    private final String images;
    private final String status;
    private final long students;
    private final BigDecimal rating;
    private final long ratingCount;
    private final BigDecimal revenue;
    private final BigDecimal progress;

    public PerformanceCourseDTO(
            Long id,
            String title,
            String images,
            String status,
            long students,
            BigDecimal rating,
            long ratingCount,
            BigDecimal revenue,
            BigDecimal progress) {
        this.id = id;
        this.title = title;
        this.images = images;
        this.status = status;
        this.students = students;
        this.rating = rating;
        this.ratingCount = ratingCount;
        this.revenue = revenue;
        this.progress = progress;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getImages() {
        return images;
    }

    public String getStatus() {
        return status;
    }

    public long getStudents() {
        return students;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public long getRatingCount() {
        return ratingCount;
    }

    public BigDecimal getRevenue() {
        return revenue;
    }

    public BigDecimal getProgress() {
        return progress;
    }
}
