package com.learnhub.backend.modules.coupon.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CouponQuoteDTO {
    private final Long id;
    private final String code;
    private final String discountType;
    private final BigDecimal discountValue;
    private final BigDecimal subtotal;
    private final BigDecimal discountAmount;
    private final BigDecimal totalAmount;
    private final String currency;
    private final LocalDateTime expiresAt;

    public CouponQuoteDTO(
            Long id,
            String code,
            String discountType,
            BigDecimal discountValue,
            BigDecimal subtotal,
            BigDecimal discountAmount,
            BigDecimal totalAmount,
            String currency,
            LocalDateTime expiresAt) {
        this.id = id;
        this.code = code;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.subtotal = subtotal;
        this.discountAmount = discountAmount;
        this.totalAmount = totalAmount;
        this.currency = currency;
        this.expiresAt = expiresAt;
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getDiscountType() {
        return discountType;
    }

    public BigDecimal getDiscountValue() {
        return discountValue;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public String getCurrency() {
        return currency;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
}
