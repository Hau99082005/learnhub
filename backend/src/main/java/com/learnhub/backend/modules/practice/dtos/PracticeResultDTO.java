package com.learnhub.backend.modules.practice.dtos;

import java.math.BigDecimal;
import java.util.List;

public class PracticeResultDTO {
    private final Long attemptId;
    private final Long courseId;
     private final BigDecimal score;
    private final boolean passed;
    private final String grade;
    private final String gradeLabel;
    private final int correctCount;
    private final int total;
    private final List<PracticeQuestionDTO> questions;

    public PracticeResultDTO(
            Long attemptId,
            Long courseId,
            BigDecimal score,
            boolean passed,
            String grade,
            String gradeLabel,
            int correctCount,
            int total,
            List<PracticeQuestionDTO> questions) {
        this.attemptId = attemptId;
        this.courseId = courseId;
        this.score = score;
        this.passed = passed;
        this.grade = grade;
        this.gradeLabel = gradeLabel;
        this.correctCount = correctCount;
        this.total = total;
        this.questions = questions == null ? List.of() : questions;
    }

    public Long getAttemptId() {
        return attemptId;
    }

    public Long getCourseId() {
        return courseId;
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

    public List<PracticeQuestionDTO> getQuestions() {
        return questions;
    }
}
