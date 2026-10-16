package com.learnhub.backend.modules.practice.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PracticeHistoryDTO {
    private final Long attemptId;
    private final Long courseId;
    private final String slug;
    private final String title;
    private final String images;
    private final BigDecimal score;
    private final boolean passed;
    private final String grade;
    private final String gradeLabel;
    private final int correctCount;
    private final int total;
    private final LocalDateTime submittedAt;

    public PracticeHistoryDTO(
            Long attemptId,
            Long courseId,
            String slug,
            String title,
            String images,
            BigDecimal score,
            boolean passed,
            String grade,
            String gradeLabel,
            int correctCount,
            int total,
            LocalDateTime submittedAt) {
        this.attemptId = attemptId;
        this.courseId = courseId;
        this.slug = slug;
        this.title = title;
        this.images = images;
        this.score = score;
        this.passed = passed;
        this.grade = grade;
        this.gradeLabel = gradeLabel;
        this.correctCount = correctCount;
        this.total = total;
        this.submittedAt = submittedAt;
    }

    public Long getAttemptId() {
        return attemptId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public String getSlug() {
        return slug;
    }

    public String getTitle() {
        return title;
    }

    public String getImages() {
        return images;
    }

    public BigDecimal getScore() {
        return score;
    }

    public boolean isPassed() {
        return passed;
    }

    public String getGrade() {
        return grade;
    }

    public String getGradeLabel() {
        return gradeLabel;
    }

    public int getCorrectCount() {
        return correctCount;
    }

    public int getTotal() {
        return total;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }
}
