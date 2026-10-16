package com.learnhub.backend.modules.practice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.practice.models.QuizAttemptAnswer;

public interface QuizAttemptAnswerRepository extends JpaRepository<QuizAttemptAnswer, Long> {
}
