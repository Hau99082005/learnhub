package com.learnhub.backend.modules.cart.dtos;

public class CheckoutRequest {
    private String provider;
    private String couponCode;

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }
}
