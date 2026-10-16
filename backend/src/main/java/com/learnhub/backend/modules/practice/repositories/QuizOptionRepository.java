package com.learnhub.backend.modules.practice.repositories;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.practice.models.QuizOption;

public interface QuizOptionRepository extends JpaRepository<QuizOption, Long> {
    List<QuizOption> findByQuestionIdInOrderBySortOrderAscIdAsc(Collection<Long> questionIds);

    void deleteByQuestionIdIn(Collection<Long> questionIds);
}
