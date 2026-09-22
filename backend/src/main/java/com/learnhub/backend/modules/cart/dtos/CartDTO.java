package com.learnhub.backend.modules.cart.dtos;

import java.math.BigDecimal;
import java.util.List;

public class CartDTO {
    private final Long id;
    private final String status;
    private final Integer itemCount;
    private final BigDecimal subtotal;
    private final String currency;
    private final List<CartItemDTO> items;

    public CartDTO(
            Long id,
            String status,
            Integer itemCount,
            BigDecimal subtotal,
            String currency,
            List<CartItemDTO> items) {
        this.id = id;
        this.status = status;
        this.itemCount = itemCount;
        this.subtotal = subtotal;
        this.currency = currency;
        this.items = items;
    }

    public Long getId() {
        return id;
    }

    public String getStatus() {
        return status;
    }

    public Integer getItemCount() {
        return itemCount;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public String getCurrency() {
        return currency;
    }

    public List<CartItemDTO> getItems() {
        return items;
    }
}
