package com.learnhub.backend.modules.cart.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.learnhub.backend.modules.cart.models.ShopOrder;

public interface ShopOrderRepository extends JpaRepository<ShopOrder, Long> {
    @Query("select o from ShopOrder o join fetch o.user where o.orderCode = :orderCode")
    Optional<ShopOrder> findByOrderCode(@Param("orderCode") String orderCode);

    boolean existsByOrderCode(String orderCode);
}
