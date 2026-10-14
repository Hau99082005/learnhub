package com.learnhub.backend.modules.coupon.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learnhub.backend.modules.coupon.dtos.CouponPreviewRequest;
import com.learnhub.backend.modules.coupon.dtos.CouponQuoteDTO;
import com.learnhub.backend.modules.coupon.services.CouponService;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {
    private final CouponService coupons;

    public CouponController(CouponService coupons) {
        this.coupons = coupons;
    }

    @GetMapping("/active")
    public ResponseEntity<List<CouponQuoteDTO>> active(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(coupons.listActive(authorization));
    }

    @PostMapping("/preview")
    public ResponseEntity<CouponQuoteDTO> preview(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody(required = false) CouponPreviewRequest request) {
        String code = request == null ? null : request.getCode();
        return ResponseEntity.ok(coupons.preview(authorization, code));
    }
}
