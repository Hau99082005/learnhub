package com.learnhub.backend.modules.cart.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class AdminOrderRowDTO {
    private final Long id;
    private final String orderCode;
    private final String status;
    private final String provider;
    private final String paymentStatus;
    private final BigDecimal totalAmount;
    private final String currency;
    private final Long userId;
    private final String userName;
    private final String userEmail;
    private final String userRole;
    private final List<String> courses;
    private final LocalDateTime paidAt;
    private final LocalDateTime createdAt;

    public AdminOrderRowDTO(
            Long id,
            String orderCode,
            String status,
            String provider,
            String paymentStatus,
            BigDecimal totalAmount,
            String currency,
            Long userId,
            String userName,
            String userEmail,
            String userRole,
            List<String> courses,
            LocalDateTime paidAt,
            LocalDateTime createdAt) {
        this.id = id;
        this.orderCode = orderCode;
        this.status = status;
        this.provider = provider;
        this.paymentStatus = paymentStatus;
        this.totalAmount = totalAmount;
        this.currency = currency;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.userRole = userRole;
        this.courses = courses;
        this.paidAt = paidAt;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getOrderCode() {
        return orderCode;
    }

    public String getStatus() {
        return status;
    }

    public String getProvider() {
        return provider;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public String getCurrency() {
        return currency;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getUserRole() {
        return userRole;
    }

    public List<String> getCourses() {
        return courses;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
