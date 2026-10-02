package com.learnhub.backend.modules.cart.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learnhub.backend.modules.cart.dtos.SePayWebhookPayload;
import com.learnhub.backend.modules.cart.dtos.SePayWebhookResponse;
import com.learnhub.backend.modules.cart.services.CheckoutService;

@RestController
@RequestMapping("/hooks")
public class SePayWebhookController {
    private final CheckoutService checkoutService;

    public SePayWebhookController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @PostMapping("/sepay-payment")
    public ResponseEntity<SePayWebhookResponse> receive(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody(required = false) SePayWebhookPayload payload) {
        checkoutService.handleSePayWebhook(authorization, payload);
        return ResponseEntity.ok(new SePayWebhookResponse(true));
    }
}
