package com.learnhub.backend.modules.cart.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PurchaseHistoryDTO {
    private final Long orderId;
    private final String orderCode;
    private final String status;
    private final String provider;
    private final String paymentStatus;
    private final BigDecimal totalAmount;
    private final String currency;
    private final LocalDateTime paidAt;
    private final LocalDateTime createdAt;
    private final List<CheckoutItemDTO> items;

    public PurchaseHistoryDTO(
            Long orderId,
            String orderCode,
            String status,
            String provider,
            String paymentStatus,
            BigDecimal totalAmount,
            String currency,
            LocalDateTime paidAt,
            LocalDateTime createdAt,
            List<CheckoutItemDTO> items) {
        this.orderId = orderId;
        this.orderCode = orderCode;
        this.status = status;
        this.provider = provider;
        this.paymentStatus = paymentStatus;
        this.totalAmount = totalAmount;
        this.currency = currency;
        this.paidAt = paidAt;
        this.createdAt = createdAt;
        this.items = items;
    }

    public Long getOrderId() {
        return orderId;
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

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<CheckoutItemDTO> getItems() {
        return items;
    }
}
