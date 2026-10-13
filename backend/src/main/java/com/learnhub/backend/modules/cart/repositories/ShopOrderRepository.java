package com.learnhub.backend.modules.cart.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.learnhub.backend.modules.cart.models.ShopOrder;

public interface ShopOrderRepository extends JpaRepository<ShopOrder, Long> {
    @Query("select o from ShopOrder o join fetch o.user where o.orderCode = :orderCode")
    Optional<ShopOrder> findByOrderCode(@Param("orderCode") String orderCode);

    @EntityGraph(attributePaths = "user")
    List<ShopOrder> findTop40ByStatusOrderByIdDesc(String status);

    @EntityGraph(attributePaths = "user")
    List<ShopOrder> findTop20ByUser_IdOrderByIdDesc(Long userId);

    @EntityGraph(attributePaths = "user")
    List<ShopOrder> findTop100ByUser_IdAndStatusOrderByIdDesc(Long userId, String status);

    boolean existsByOrderCode(String orderCode);

    long countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(LocalDateTime start, LocalDateTime end);
}
