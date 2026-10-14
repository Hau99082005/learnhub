package com.learnhub.backend.modules.cart.dtos;

import java.math.BigDecimal;
import java.util.List;

public class CheckoutDTO {
    private final Long orderId;
    private final String orderCode;
    private final String status;
    private final String provider;
    private final String paymentStatus;
    private final BigDecimal subtotal;
    private final BigDecimal discountAmount;
    private final BigDecimal totalAmount;
    private final String couponCode;
    private final String currency;
    private final String checkoutUrl;
    private final BankTransferDTO bankTransfer;
    private final SePayGatewayDTO gateway;
    private final List<CheckoutItemDTO> items;

    public CheckoutDTO(
            Long orderId,
            String orderCode,
            String status,
            String provider,
            String paymentStatus,
            BigDecimal subtotal,
            BigDecimal discountAmount,
            BigDecimal totalAmount,
            String couponCode,
            String currency,
            String checkoutUrl,
            BankTransferDTO bankTransfer,
            SePayGatewayDTO gateway,
            List<CheckoutItemDTO> items) {
        this.orderId = orderId;
        this.orderCode = orderCode;
        this.status = status;
        this.provider = provider;
        this.paymentStatus = paymentStatus;
        this.subtotal = subtotal;
        this.discountAmount = discountAmount;
        this.totalAmount = totalAmount;
        this.couponCode = couponCode;
        this.currency = currency;
        this.checkoutUrl = checkoutUrl;
        this.bankTransfer = bankTransfer;
        this.gateway = gateway;
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

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public String getCurrency() {
        return currency;
    }

    public String getCheckoutUrl() {
        return checkoutUrl;
    }

    public BankTransferDTO getBankTransfer() {
        return bankTransfer;
    }

    public SePayGatewayDTO getGateway() {
        return gateway;
    }

    public List<CheckoutItemDTO> getItems() {
        return items;
    }
}
