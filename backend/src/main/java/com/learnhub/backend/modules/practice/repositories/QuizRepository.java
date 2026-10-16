package com.learnhub.backend.modules.practice.repositories;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.learnhub.backend.modules.practice.models.Quiz;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    Optional<Quiz> findByLessonId(Long lessonId);

    @Query("""
            select q from Quiz q
            where q.lessonId in (
                select l.id from Lesson l
                where l.section.course.id in :courseIds
            )
            """)
    List<Quiz> findByCourseIdIn(@Param("courseIds") Collection<Long> courseIds);
}
