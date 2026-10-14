package com.learnhub.backend.modules.instructor.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.instructor.models.InstructorCopyTemplate;

public interface InstructorCopyTemplateRepository extends JpaRepository<InstructorCopyTemplate, Long> {
    List<InstructorCopyTemplate> findByUser_IdOrderByUpdatedAtDesc(Long userId);

    Optional<InstructorCopyTemplate> findByIdAndUser_Id(Long id, Long userId);

    long countByUser_Id(Long userId);
}
