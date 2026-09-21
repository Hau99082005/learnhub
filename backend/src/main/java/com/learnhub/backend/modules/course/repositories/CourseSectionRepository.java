package com.learnhub.backend.modules.course.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.learnhub.backend.modules.course.models.CourseSection;

public interface CourseSectionRepository extends JpaRepository<CourseSection, Long> {
    List<CourseSection> findByCourseIdOrderBySortOrderAscIdAsc(Long courseId);

    Optional<CourseSection> findByIdAndCourseId(Long id, Long courseId);

    @Query("select coalesce(max(s.sortOrder), -1) from CourseSection s where s.course.id = :courseId")
    int maxSortOrder(@Param("courseId") Long courseId);
}
