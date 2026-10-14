package com.learnhub.backend.modules.coupon.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.coupon.models.CouponUsage;

public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {
    boolean existsByCouponIdAndUserId(Long couponId, Long userId);

    boolean existsByCouponIdAndOrderId(Long couponId, Long orderId);
}
