package com.learnhub.backend.modules.cart.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.cart.models.Enrollment;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);
}
