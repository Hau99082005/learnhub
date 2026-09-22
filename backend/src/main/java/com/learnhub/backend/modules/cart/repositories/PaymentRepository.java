package com.learnhub.backend.modules.cart.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.cart.models.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findFirstByOrderIdOrderByIdDesc(Long orderId);
}
