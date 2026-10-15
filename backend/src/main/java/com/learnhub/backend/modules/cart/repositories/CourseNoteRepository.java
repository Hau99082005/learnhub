package com.learnhub.backend.modules.cart.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.cart.models.CourseNote;

public interface CourseNoteRepository extends JpaRepository<CourseNote, Long> {
    List<CourseNote> findByUserIdAndCourseIdOrderByCreatedAtDesc(Long userId, Long courseId);

    Optional<CourseNote> findByIdAndUserId(Long id, Long userId);
}
