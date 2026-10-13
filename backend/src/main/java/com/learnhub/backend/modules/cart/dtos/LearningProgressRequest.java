package com.learnhub.backend.modules.cart.dtos;

import java.math.BigDecimal;

public class LearningProgressRequest {
    private BigDecimal percent;

    public BigDecimal getPercent() {
        return percent;
    }

    public void setPercent(BigDecimal percent) {
        this.percent = percent;
    }
}
