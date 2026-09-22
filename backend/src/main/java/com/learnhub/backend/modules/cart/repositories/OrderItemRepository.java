package com.learnhub.backend.modules.cart.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.learnhub.backend.modules.cart.models.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    @Query("select i from OrderItem i join fetch i.course c left join fetch c.instructor where i.order.id = :orderId order by i.id asc")
    List<OrderItem> findByOrderIdWithCourse(@Param("orderId") Long orderId);
}
