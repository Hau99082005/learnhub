package com.learnhub.backend.modules.practice.dtos;

import java.math.BigDecimal;
import java.util.List;

public class PracticeQuizDTO {
    private final Long quizId;
    private final Long courseId;
    private final String title;
    private final String description;
    private final String courseTitle;
    private final String slug;
    private final String images;
    private final int passScore;
    private final int questionCount;
    private final BigDecimal bestScore;
    private final String gradeLabel;
    private final List<PracticeQuestionDTO> questions;

    public PracticeQuizDTO(
            Long quizId,
            Long courseId,
            String title,
            String description,
            String courseTitle,
            String slug,
            String images,
            int passScore,
            int questionCount,
            BigDecimal bestScore,
            String gradeLabel,
            List<PracticeQuestionDTO> questions) {
        this.quizId = quizId;
        this.courseId = courseId;
        this.title = title;
        this.description = description;
        this.courseTitle = courseTitle;
        this.slug = slug;
        this.images = images;
        this.passScore = passScore;
        this.questionCount = questionCount;
        this.bestScore = bestScore;
        this.gradeLabel = gradeLabel;
        this.questions = questions == null ? List.of() : questions;
    }

    public Long getQuizId() {
        return quizId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public String getSlug() {
        return slug;
    }

    public String getImages() {
        return images;
    }

    public int getPassScore() {
        return passScore;
    }

    public int getQuestionCount() {
        return questionCount;
    }

    public BigDecimal getBestScore() {
        return bestScore;
    }

    public String getGradeLabel() {
        return gradeLabel;
    }

    public List<PracticeQuestionDTO> getQuestions() {
        return questions;
    }
}
