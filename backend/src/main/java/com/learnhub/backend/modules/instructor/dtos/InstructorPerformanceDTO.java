package com.learnhub.backend.modules.instructor.dtos;

import java.math.BigDecimal;
import java.util.List;

import com.learnhub.backend.modules.user.dtos.DashboardCardDTO;

public class InstructorPerformanceDTO {
    private final List<DashboardCardDTO> cards;
    private final List<PerformanceTrendDTO> trend;
    private final List<PerformanceCourseDTO> courses;
    private final BigDecimal rating;
    private final long ratingCount;
    private final String from;
    private final String to;

    public InstructorPerformanceDTO(
            List<DashboardCardDTO> cards,
            List<PerformanceTrendDTO> trend,
            List<PerformanceCourseDTO> courses,
            BigDecimal rating,
            long ratingCount,
            String from,
            String to) {
        this.cards = cards;
        this.trend = trend;
        this.courses = courses;
        this.rating = rating;
        this.ratingCount = ratingCount;
        this.from = from;
        this.to = to;
    }

    public List<DashboardCardDTO> getCards() {
        return cards;
    }

    public List<PerformanceTrendDTO> getTrend() {
        return trend;
    }

    public List<PerformanceCourseDTO> getCourses() {
        return courses;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public long getRatingCount() {
        return ratingCount;
    }

    public String getFrom() {
        return from;
    }

    public String getTo() {
        return to;
    }
}
