package com.learnhub.backend.modules.banner.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.learnhub.backend.modules.banner.dtos.BannerRequest;
import com.learnhub.backend.modules.banner.dtos.bannerDTO;
import com.learnhub.backend.modules.banner.services.interfaces.BannerServicesInterfaces;

@RestController
@RequestMapping("/api/admin/banners")
public class AdminBannerController {
    private final BannerServicesInterfaces bannerServices;

    public AdminBannerController(BannerServicesInterfaces bannerServices) {
        this.bannerServices = bannerServices;
    }

    @GetMapping
    public ResponseEntity<List<bannerDTO>> list(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(bannerServices.listAll(authorization));
    }

    @GetMapping("/{id}")
    public ResponseEntity<bannerDTO> detail(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id) {
        return ResponseEntity.ok(bannerServices.findById(authorization, id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<bannerDTO> create(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam("image") MultipartFile image) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bannerServices.create(authorization, toRequest(title, isActive), image));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<bannerDTO> update(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(bannerServices.update(authorization, id, toRequest(title, isActive), image));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id) {
        bannerServices.delete(authorization, id);
        return ResponseEntity.noContent().build();
    }

    private BannerRequest toRequest(String title, Boolean isActive) {
        BannerRequest request = new BannerRequest();
        request.setTitle(title);
        request.setIsActive(isActive);
        return request;
    }
}
