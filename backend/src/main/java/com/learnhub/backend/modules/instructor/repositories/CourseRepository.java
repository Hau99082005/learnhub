package com.learnhub.backend.modules.instructor.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.learnhub.backend.modules.instructor.models.Course;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByInstructorIdOrderByCreatedAtDesc(Long instructorId);

    List<Course> findByDeletedAtIsNullOrderByCreatedAtDesc();

    List<Course> findByDeletedAtIsNullAndStatusOrderByPublishedAtDesc(String status);

    List<Course> findByDeletedAtIsNullAndStatusAndCategory_SlugOrderByPublishedAtDesc(
            String status,
            String slug);

    @Query("""
            select distinct c from Course c
            left join c.instructor i
            left join c.category cat
            where c.deletedAt is null
              and c.status = :status
              and (
                lower(c.title) like lower(concat('%', :q, '%'))
                or lower(coalesce(c.subtitle, '')) like lower(concat('%', :q, '%'))
                or lower(coalesce(c.description, '')) like lower(concat('%', :q, '%'))
                or lower(coalesce(c.slug, '')) like lower(concat('%', :q, '%'))
                or lower(coalesce(i.fullName, '')) like lower(concat('%', :q, '%'))
                or lower(coalesce(cat.name, '')) like lower(concat('%', :q, '%'))
              )
            order by c.publishedAt desc
            """)
    List<Course> searchPublished(@Param("status") String status, @Param("q") String q);

    Optional<Course> findBySlugAndDeletedAtIsNull(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    long countByDeletedAtIsNull();

    long countByDeletedAtIsNullAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
            LocalDateTime start,
            LocalDateTime end);
}
