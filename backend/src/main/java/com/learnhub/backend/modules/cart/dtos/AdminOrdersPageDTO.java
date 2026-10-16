package com.learnhub.backend.modules.cart.dtos;

import java.math.BigDecimal;
import java.util.List;

public class AdminOrdersPageDTO {
    private final List<AdminOrderStatusCountDTO> groups;
    private final BigDecimal paidAmount;
    private final List<AdminOrderRowDTO> orders;

    public AdminOrdersPageDTO(
            List<AdminOrderStatusCountDTO> groups,
            BigDecimal paidAmount,
            List<AdminOrderRowDTO> orders) {
        this.groups = groups;
        this.paidAmount = paidAmount;
        this.orders = orders;
    }

    public List<AdminOrderStatusCountDTO> getGroups() {
        return groups;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public List<AdminOrderRowDTO> getOrders() {
        return orders;
    }
}
