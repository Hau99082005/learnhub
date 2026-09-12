package com.learnhub.backend.modules.banner.services.impl;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.learnhub.backend.modules.banner.dtos.BannerRequest;
import com.learnhub.backend.modules.banner.dtos.bannerDTO;
import com.learnhub.backend.modules.banner.models.banner;
import com.learnhub.backend.modules.banner.repositories.bannerRepository;
import com.learnhub.backend.modules.banner.services.BannerImageStorage;
import com.learnhub.backend.modules.banner.services.interfaces.BannerServicesInterfaces;
import com.learnhub.backend.modules.user.exceptions.AuthException;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;
import com.learnhub.backend.services.BaseServices;

@Service
public class BannerServices extends BaseServices implements BannerServicesInterfaces {
    private final bannerRepository banners;
    private final UserServicesInterfaces userServices;
    private final BannerImageStorage images;

    public BannerServices(
            bannerRepository banners,
            UserServicesInterfaces userServices,
            BannerImageStorage images) {
        this.banners = banners;
        this.userServices = userServices;
        this.images = images;
    }

    @Override
    @Transactional(readOnly = true)
    public List<bannerDTO> listActive() {
        return banners.findByIsActiveTrueOrderByIdAsc().stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<bannerDTO> listAll(String authorization) {
        userServices.requireAdmin(authorization);
        return banners.findAllByOrderByIdAsc().stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public bannerDTO findById(String authorization, Long id) {
        userServices.requireAdmin(authorization);
        return toDto(requireBanner(id));
    }

    @Override
    @Transactional
    public bannerDTO create(String authorization, BannerRequest request, MultipartFile image) {
        userServices.requireAdmin(authorization);
        banner item = new banner();
        apply(item, request, images.save(image), image, true);
        banners.save(item);
        return toDto(item);
    }

    @Override
    @Transactional
    public bannerDTO update(String authorization, Long id, BannerRequest request, MultipartFile image) {
        userServices.requireAdmin(authorization);
        banner item = requireBanner(id);
        String imageUrl = item.getImageUrl();
        MultipartFile nextImage = null;
        if (image != null && !image.isEmpty()) {
            String next = images.save(image);
            images.deleteIfOwned(imageUrl);
            imageUrl = next;
            nextImage = image;
        }
        apply(item, request, imageUrl, nextImage, false);
        banners.save(item);
        return toDto(item);
    }

    @Override
    @Transactional
    public void delete(String authorization, Long id) {
        userServices.requireAdmin(authorization);
        banner item = requireBanner(id);
        images.deleteIfOwned(item.getImageUrl());
        banners.delete(item);
    }

    private banner requireBanner(Long id) {
        return banners.findById(id)
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy banner"));
    }

    private void apply(banner item, BannerRequest request, String imageUrl, MultipartFile image, boolean requireImage) {
        String title = request.getTitle() == null ? "" : request.getTitle().trim();
        if (title.isBlank() && image != null && image.getOriginalFilename() != null) {
            title = titleFromFilename(image.getOriginalFilename());
        }
        if (title.isBlank()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng chọn ảnh banner", "image");
        }
        if (requireImage && (imageUrl == null || imageUrl.isBlank())) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng chọn ảnh banner", "image");
        }
        item.setTitle(title);
        item.setImageUrl(imageUrl);
        item.setIsActive(request.getIsActive() == null || request.getIsActive());
    }

    private String titleFromFilename(String filename) {
        String name = filename.replace("\\", "/");
        int slash = name.lastIndexOf('/');
        if (slash >= 0) {
            name = name.substring(slash + 1);
        }
        int dot = name.lastIndexOf('.');
        if (dot > 0) {
            name = name.substring(0, dot);
        }
        return name.trim();
    }

    private bannerDTO toDto(banner item) {
        return new bannerDTO(
                item.getId(),
                item.getTitle(),
                item.getImageUrl(),
                item.getIsActive(),
                item.getCreatedAt(),
                item.getUpdatedAt());
    }
}
