package com.learnhub.backend.modules.cart.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.learnhub.backend.modules.cart.dtos.SePayWebhookResponse;
import com.learnhub.backend.modules.cart.services.CheckoutService;

@RestController
public class SePayIpnController {
    private final CheckoutService checkoutService;

    public SePayIpnController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @GetMapping({"/api/notifications", "/check-notification", "/hooks/sepay-payment"})
    public ResponseEntity<SePayWebhookResponse> ping() {
        return ResponseEntity.ok(new SePayWebhookResponse(true));
    }

    @PostMapping({"/api/notifications", "/check-notification"})
    public ResponseEntity<SePayWebhookResponse> receive(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Secret-Key", required = false) String secretKey,
            @RequestHeader(value = "X-Api-Key", required = false) String apiKey,
            @RequestBody(required = false) String rawBody) {
        String auth = firstNonBlank(authorization, secretKey, apiKey);
        checkoutService.handleSePayIpn(auth, rawBody);
        return ResponseEntity.ok(new SePayWebhookResponse(true));
    }

    private String firstNonBlank(String... values) {
        if (values == null) {
            return "";
        }
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return "";
    }
}
