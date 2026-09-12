package com.learnhub.backend.modules.banner.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learnhub.backend.modules.banner.dtos.bannerDTO;
import com.learnhub.backend.modules.banner.services.interfaces.BannerServicesInterfaces;

@RestController
@RequestMapping("/api/banners")
public class BannerController {
    private final BannerServicesInterfaces bannerServices;

    public BannerController(BannerServicesInterfaces bannerServices) {
        this.bannerServices = bannerServices;
    }

    @GetMapping
    public ResponseEntity<List<bannerDTO>> listActive() {
        return ResponseEntity.ok(bannerServices.listActive());
    }
}
