package com.learnhub.backend.modules.instructor.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.instructor.models.Course;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByInstructorIdOrderByCreatedAtDesc(Long instructorId);

    List<Course> findByDeletedAtIsNullOrderByCreatedAtDesc();

    List<Course> findByDeletedAtIsNullAndStatusOrderByPublishedAtDesc(String status);

    Optional<Course> findBySlugAndDeletedAtIsNull(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}
