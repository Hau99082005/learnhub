package com.learnhub.backend.modules.cart.controllers;

import java.util.List;

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

import com.learnhub.backend.modules.cart.dtos.CartItemRequest;
import com.learnhub.backend.modules.cart.services.WishlistService;
import com.learnhub.backend.modules.course.dtos.CourseAdminDTO;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {
    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<List<CourseAdminDTO>> list(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(wishlistService.list(authorization));
    }

    @PostMapping
    public ResponseEntity<List<CourseAdminDTO>> add(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody(required = false) CartItemRequest request) {
        Long courseId = request == null ? null : request.getCourseId();
        return ResponseEntity.status(HttpStatus.CREATED).body(wishlistService.add(authorization, courseId));
    }

    @PostMapping("/{courseId}")
    public ResponseEntity<List<CourseAdminDTO>> addById(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long courseId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(wishlistService.add(authorization, courseId));
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<List<CourseAdminDTO>> remove(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long courseId) {
        return ResponseEntity.ok(wishlistService.remove(authorization, courseId));
    }
}
