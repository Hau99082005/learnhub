package com.learnhub.backend.modules.cart.repositories;

import java.math.BigDecimal;
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

    @EntityGraph(attributePaths = "user")
    List<ShopOrder> findTop300ByOrderByIdDesc();

    @Query("select upper(o.status), count(o) from ShopOrder o group by upper(o.status)")
    List<Object[]> countGroupedByStatus();

    @Query("""
            select upper(coalesce(u.role, 'USER')), upper(o.status), count(o)
            from ShopOrder o join o.user u
            group by upper(coalesce(u.role, 'USER')), upper(o.status)
            """)
    List<Object[]> countGroupedByRoleAndStatus();

    @Query("select count(distinct o.user.id) from ShopOrder o")
    long countDistinctBuyers();

    @Query("select count(distinct o.user.id) from ShopOrder o where upper(o.user.role) = :role")
    long countDistinctBuyersByRole(@Param("role") String role);

    @Query("select coalesce(sum(o.totalAmount), 0) from ShopOrder o where upper(o.status) = 'PAID'")
    BigDecimal sumPaidTotal();
}
