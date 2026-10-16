package com.learnhub.backend.modules.course.repositories;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.learnhub.backend.modules.course.models.Lesson;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    @Query("select l from Lesson l join fetch l.section left join fetch l.media where l.section.id in :ids order by l.sortOrder asc, l.id asc")
    List<Lesson> findBySectionIdInOrderBySortOrderAscIdAsc(@Param("ids") Collection<Long> ids);

    @Query("select l from Lesson l left join fetch l.media where l.section.id = :sectionId order by l.sortOrder asc, l.id asc")
    List<Lesson> findBySectionIdOrderBySortOrderAscIdAsc(@Param("sectionId") Long sectionId);

    @Query("select l from Lesson l left join fetch l.media where l.id = :id and l.section.id = :sectionId")
    Optional<Lesson> findByIdAndSectionId(@Param("id") Long id, @Param("sectionId") Long sectionId);

    @Query("select coalesce(max(l.sortOrder), -1) from Lesson l where l.section.id = :sectionId")
    int maxSortOrder(@Param("sectionId") Long sectionId);

    @Query("select coalesce(sum(l.durationSeconds), 0) from Lesson l where l.section.course.id = :courseId")
    int totalDuration(@Param("courseId") Long courseId);

    @Query("select l.section.course.id, count(l) from Lesson l where l.section.course.id in :ids group by l.section.course.id")
    List<Object[]> countGroupedByCourseIds(@Param("ids") Collection<Long> ids);

    @Query("""
            select l.section.course.id, count(l) from Lesson l
            where l.section.course.id in :ids and l.media is not null
            group by l.section.course.id
            """)
    List<Object[]> countWithMediaByCourseIds(@Param("ids") Collection<Long> ids);

    boolean existsBySlugAndSectionId(String slug, Long sectionId);

    boolean existsBySlugAndSectionIdAndIdNot(String slug, Long sectionId, Long id);

    @Query("""
            select l from Lesson l
            join fetch l.section s
            where s.course.id = :courseId
              and l.slug = :slug
            order by l.id asc
            """)
    List<Lesson> findByCourseIdAndSlug(@Param("courseId") Long courseId, @Param("slug") String slug);

    @Query("""
            select l from Lesson l
            join fetch l.section s
            where s.course.id = :courseId
              and l.lessonType = 'VIDEO'
              and l.isPublished = 1
            order by s.sortOrder asc, l.sortOrder asc, l.id asc
            """)
    List<Lesson> findPublishedVideosByCourseId(@Param("courseId") Long courseId);

    @Query("""
            select l.title from Lesson l
            where l.lessonType = 'VIDEO'
              and l.isPublished = 1
              and l.section.course.id <> :courseId
              and l.title is not null
            order by l.id desc
            """)
    List<String> recentTitlesOutsideCourse(@Param("courseId") Long courseId, Pageable pageable);

    @Query("""
            select l from Lesson l
            join fetch l.section s
            join fetch s.course c
            where l.id in :ids
            """)
    List<Lesson> findWithCourseByIdIn(@Param("ids") Collection<Long> ids);
}
