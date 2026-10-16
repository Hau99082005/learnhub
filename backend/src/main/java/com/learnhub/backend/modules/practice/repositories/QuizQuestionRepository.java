package com.learnhub.backend.modules.practice.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.practice.models.QuizQuestion;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
    List<QuizQuestion> findByQuizIdOrderBySortOrderAscIdAsc(Long quizId);

    long countByQuizId(Long quizId);

    void deleteByQuizId(Long quizId);
}
