package com.learnhub.backend.modules.coupon.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.learnhub.backend.modules.coupon.models.Coupon;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    @Query("""
            select c from Coupon c
            where c.status = 'ACTIVE'
              and (c.startsAt is null or c.startsAt <= :now)
              and (c.expiresAt is null or c.expiresAt >= :now)
            order by c.expiresAt asc
            """)
    List<Coupon> findActiveAt(@Param("now") LocalDateTime now);

    @Query(value = "select course_id from coupon_courses where coupon_id = :id", nativeQuery = true)
    List<Long> findCourseIds(@Param("id") Long id);
}
