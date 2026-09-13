package com.learnhub.backend.modules.instructor.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.instructor.models.InstructorOnboarding;

public interface InstructorOnboardingRepository extends JpaRepository<InstructorOnboarding, Long> {
    Optional<InstructorOnboarding> findByUserId(Long userId);
}
