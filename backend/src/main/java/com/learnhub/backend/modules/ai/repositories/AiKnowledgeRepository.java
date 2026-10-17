package com.learnhub.backend.modules.ai.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.learnhub.backend.modules.instructor.models.Course;

public interface AiKnowledgeRepository extends JpaRepository<Course, Long> {
    @Query(value = """
            SELECT
                c.title,
                c.slug,
                c.level,
                c.price,
                c.currency,
                CASE WHEN c.is_free = 1 OR c.price <= 0 THEN 1 ELSE 0 END,
                COALESCE(NULLIF(TRIM(c.instructor_name), ''), u.full_name, u.username, 'LearnHub'),
                COALESCE(cat.name, 'Khác'),
                ROUND(c.duration_seconds / 3600, 1),
                c.images,
                CASE WHEN c.issues_certificate = 1 THEN 1 ELSE 0 END
            FROM courses c
            LEFT JOIN users u ON u.id = c.instructor_id
            LEFT JOIN categories cat ON cat.id = c.category_id
            WHERE c.deleted_at IS NULL
              AND c.status = 'PUBLISHED'
            ORDER BY c.published_at DESC
            LIMIT 40
            """, nativeQuery = true)
    List<Object[]> listPublishedCourses();

    @Query(value = """
            SELECT
                c.title,
                c.slug,
                e.progress_percent,
                e.status,
                c.images,
                c.price,
                c.currency,
                COALESCE(NULLIF(TRIM(c.instructor_name), ''), u.full_name, u.username, 'LearnHub'),
                CASE WHEN c.is_free = 1 OR c.price <= 0 THEN 1 ELSE 0 END
            FROM enrollments e
            JOIN courses c ON c.id = e.course_id
            LEFT JOIN users u ON u.id = c.instructor_id
            WHERE e.user_id = :userId
              AND e.status IN ('ACTIVE', 'COMPLETED')
              AND c.deleted_at IS NULL
            ORDER BY e.enrolled_at DESC
            LIMIT 20
            """, nativeQuery = true)
    List<Object[]> listLearnerCourses(@Param("userId") Long userId);

    @Query(value = """
            SELECT
                o.order_code,
                o.status,
                o.total_amount,
                o.currency,
                o.created_at,
                GROUP_CONCAT(oi.course_title ORDER BY oi.id SEPARATOR ', ')
            FROM orders o
            LEFT JOIN order_items oi ON oi.order_id = o.id
            WHERE o.user_id = :userId
            GROUP BY o.id, o.order_code, o.status, o.total_amount, o.currency, o.created_at
            ORDER BY o.id DESC
            LIMIT 15
            """, nativeQuery = true)
    List<Object[]> listUserOrders(@Param("userId") Long userId);

    @Query(value = """
            SELECT
                COALESCE(cert.course_title, c.title),
                cert.grade,
                cert.watch_percent,
                cert.certificate_code
            FROM certificates cert
            JOIN enrollments e ON e.id = cert.enrollment_id
            LEFT JOIN courses c ON c.id = e.course_id
            WHERE e.user_id = :userId
            ORDER BY cert.id DESC
            LIMIT 10
            """, nativeQuery = true)
    List<Object[]> listLearnerCertificates(@Param("userId") Long userId);
}
