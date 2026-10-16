package com.learnhub.backend.modules.practice.dtos;

import java.math.BigDecimal;

public class PracticeCourseDTO {
    private final Long courseId;
    private final String title;
    private final String slug;
    private final String images;
    private final String instructorName;
    private final BigDecimal progressPercent;
    private final int questionCount;
    private final int attemptCount;
    private final BigDecimal bestScore;
    private final boolean passed;
    private final String grade;
    private final String gradeLabel;
    private final boolean ready;

    public PracticeCourseDTO(
            Long courseId,
            String title,
            String slug,
            String images,
            String instructorName,
            BigDecimal progressPercent,
            int questionCount,
            int attemptCount,
            BigDecimal bestScore,
            boolean passed,
            String grade,
            String gradeLabel,
            boolean ready) {
        this.courseId = courseId;
        this.title = title;
        this.slug = slug;
        this.images = images;
        this.instructorName = instructorName;
        this.progressPercent = progressPercent;
        this.questionCount = questionCount;
        this.attemptCount = attemptCount;
        this.bestScore = bestScore;
        this.passed = passed;
        this.grade = grade;
        this.gradeLabel = gradeLabel;
        this.ready = ready;
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

    public BigDecimal getProgressPercent() {
        return progressPercent;
    }

    public int getQuestionCount() {
        return questionCount;
    }

    public int getAttemptCount() {
        return attemptCount;
    }

    public BigDecimal getBestScore() {
        return bestScore;
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

    public boolean isReady() {
        return ready;
    }
}
