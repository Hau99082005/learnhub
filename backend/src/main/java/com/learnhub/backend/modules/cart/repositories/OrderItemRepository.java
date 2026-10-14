package com.learnhub.backend.modules.cart.repositories;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.learnhub.backend.modules.cart.models.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    @Query("select i from OrderItem i join fetch i.course c left join fetch c.instructor where i.order.id = :orderId order by i.id asc")
    List<OrderItem> findByOrderIdWithCourse(@Param("orderId") Long orderId);

    @Query("""
            select i from OrderItem i
            join fetch i.order o
            join fetch i.course c
            where c.instructor.id = :instructorId
              and o.status = 'PAID'
            """)
    List<OrderItem> findPaidByInstructor(@Param("instructorId") Long instructorId);

    @Query("""
            select coalesce(sum(i.unitPrice), 0) from OrderItem i
            join i.order o
            join i.course c
            where c.id in :courseIds
              and o.status = 'PAID'
            """)
    BigDecimal sumPaidByCourseIds(@Param("courseIds") Collection<Long> courseIds);

    @Query("""
            select coalesce(sum(i.unitPrice), 0) from OrderItem i
            join i.order o
            join i.course c
            where c.id in :courseIds
              and o.status = 'PAID'
              and coalesce(o.paidAt, o.createdAt) >= :start
              and coalesce(o.paidAt, o.createdAt) < :end
            """)
    BigDecimal sumPaidByCourseIdsBetween(
            @Param("courseIds") Collection<Long> courseIds,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}
