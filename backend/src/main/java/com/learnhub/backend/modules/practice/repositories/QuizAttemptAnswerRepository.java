package com.learnhub.backend.modules.practice.repositories;

import java.util.Collection;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.practice.models.QuizAttemptAnswer;

public interface QuizAttemptAnswerRepository extends JpaRepository<QuizAttemptAnswer, Long> {
    void deleteByQuestionIdIn(Collection<Long> questionIds);
}
