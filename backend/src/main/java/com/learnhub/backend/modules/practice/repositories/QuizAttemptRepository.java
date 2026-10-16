package com.learnhub.backend.modules.practice.repositories;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.practice.models.QuizAttempt;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByQuizIdInAndUserIdAndSubmittedAtIsNotNull(Collection<Long> quizIds, Long userId);

    Optional<QuizAttempt> findTopByQuizIdAndUserIdAndSubmittedAtIsNotNullOrderByScoreDescIdDesc(
            Long quizId,
            Long userId);

    long countByQuizIdAndUserIdAndSubmittedAtIsNotNull(Long quizId, Long userId);

    List<QuizAttempt> findByUserIdAndSubmittedAtIsNotNullOrderBySubmittedAtDesc(Long userId);
}
