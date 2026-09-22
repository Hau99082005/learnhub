package com.learnhub.backend.modules.cart.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.learnhub.backend.modules.cart.models.Cart;

public interface CartRepository extends JpaRepository<Cart, Long> {
    @Query("select c from Cart c where c.user.id = :userId and c.status = :status")
    Optional<Cart> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") String status);
}
