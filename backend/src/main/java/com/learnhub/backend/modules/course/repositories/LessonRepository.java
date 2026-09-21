package com.learnhub.backend.modules.course.repositories;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

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

    boolean existsBySlugAndSectionId(String slug, Long sectionId);

    boolean existsBySlugAndSectionIdAndIdNot(String slug, Long sectionId, Long id);
}
