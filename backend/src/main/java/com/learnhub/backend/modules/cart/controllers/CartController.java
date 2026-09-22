package com.learnhub.backend.modules.cart.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learnhub.backend.modules.cart.dtos.CartDTO;
import com.learnhub.backend.modules.cart.dtos.CartItemRequest;
import com.learnhub.backend.modules.cart.services.CartService;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartDTO> get(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(cartService.getCart(authorization));
    }

    @PostMapping("/items")
    public ResponseEntity<CartDTO> add(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody(required = false) CartItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cartService.addItem(authorization, request));
    }

    @DeleteMapping("/items/{courseId}")
    public ResponseEntity<CartDTO> remove(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long courseId) {
        return ResponseEntity.ok(cartService.removeItem(authorization, courseId));
    }
}
