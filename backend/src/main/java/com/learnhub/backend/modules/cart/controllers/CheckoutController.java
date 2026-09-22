package com.learnhub.backend.modules.cart.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learnhub.backend.modules.cart.dtos.CheckoutDTO;
import com.learnhub.backend.modules.cart.dtos.CheckoutRequest;
import com.learnhub.backend.modules.cart.services.CheckoutService;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {
    private final CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @PostMapping
    public ResponseEntity<CheckoutDTO> create(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody(required = false) CheckoutRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(checkoutService.create(authorization, request));
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<CheckoutDTO> get(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String orderCode) {
        return ResponseEntity.ok(checkoutService.get(authorization, orderCode));
    }

    @PostMapping("/{orderCode}/confirm")
    public ResponseEntity<CheckoutDTO> confirm(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String orderCode) {
        return ResponseEntity.ok(checkoutService.confirm(authorization, orderCode));
    }
}
