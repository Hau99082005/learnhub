package com.learnhub.backend.modules.cart.repositories;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.learnhub.backend.modules.cart.models.Enrollment;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);

    List<Enrollment> findByUserIdOrderByEnrolledAtDesc(Long userId);

    @Query("""
            select e from Enrollment e
            where e.userId = :userId
              and exists (
                select 1 from Course c
                left join c.instructor i
                left join c.category cat
                where c.id = e.courseId
                  and c.deletedAt is null
                  and (
                    lower(c.title) like lower(concat('%', :q, '%'))
                    or lower(coalesce(c.subtitle, '')) like lower(concat('%', :q, '%'))
                    or lower(coalesce(i.fullName, '')) like lower(concat('%', :q, '%'))
                    or lower(coalesce(cat.name, '')) like lower(concat('%', :q, '%'))
                  )
              )
            order by e.enrolledAt desc
            """)
    List<Enrollment> searchByUserId(@Param("userId") Long userId, @Param("q") String q);

    List<Enrollment> findByCourseIdIn(Collection<Long> courseIds);

    long countByCourseIdIn(Collection<Long> courseIds);

    @Query("""
            select count(e) from Enrollment e
            where e.courseId in :courseIds
              and coalesce(e.enrolledAt, e.createdAt) >= :start
              and coalesce(e.enrolledAt, e.createdAt) < :end
            """)
    long countByCourseIdInAndEnrolledBetween(
            @Param("courseIds") Collection<Long> courseIds,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}
