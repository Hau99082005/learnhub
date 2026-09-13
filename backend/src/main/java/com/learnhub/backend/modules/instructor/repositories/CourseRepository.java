package com.learnhub.backend.modules.instructor.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.instructor.models.Course;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByInstructorIdOrderByCreatedAtDesc(Long instructorId);
}
