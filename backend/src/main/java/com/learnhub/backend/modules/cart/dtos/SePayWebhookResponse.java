package com.learnhub.backend.modules.cart.dtos;

public class SePayWebhookResponse {
    private final boolean success;

    public SePayWebhookResponse(boolean success) {
        this.success = success;
    }

    public boolean isSuccess() {
        return success;
    }
}
