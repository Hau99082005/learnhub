package com.learnhub.backend.modules.instructor.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.instructor.models.InstructorResourceProgress;

public interface InstructorResourceProgressRepository extends JpaRepository<InstructorResourceProgress, Long> {
    List<InstructorResourceProgress> findByUser_Id(Long userId);

    Optional<InstructorResourceProgress> findByUser_IdAndItemKey(Long userId, String itemKey);
}
