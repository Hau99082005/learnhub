package com.learnhub.backend.modules.cart.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.learnhub.backend.modules.cart.models.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    @Query("select i from CartItem i join fetch i.course c left join fetch c.instructor left join fetch c.category where i.cart.id = :cartId order by i.createdAt desc, i.id desc")
    List<CartItem> findByCartIdWithCourse(@Param("cartId") Long cartId);

    Optional<CartItem> findByCartIdAndCourseId(Long cartId, Long courseId);

    boolean existsByCartIdAndCourseId(Long cartId, Long courseId);

    void deleteByCartIdAndCourseId(Long cartId, Long courseId);
}
