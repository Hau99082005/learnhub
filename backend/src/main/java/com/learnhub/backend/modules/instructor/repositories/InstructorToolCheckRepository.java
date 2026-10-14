package com.learnhub.backend.modules.instructor.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.instructor.models.InstructorToolCheck;

public interface InstructorToolCheckRepository extends JpaRepository<InstructorToolCheck, Long> {
    List<InstructorToolCheck> findByUser_Id(Long userId);

    Optional<InstructorToolCheck> findByUser_IdAndItemKey(Long userId, String itemKey);
}
