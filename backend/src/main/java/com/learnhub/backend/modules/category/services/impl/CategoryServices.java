package com.learnhub.backend.modules.category.services.impl;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.learnhub.backend.modules.category.dtos.CategoryRequest;
import com.learnhub.backend.modules.category.dtos.categoryDTO;
import com.learnhub.backend.modules.category.models.Category;
import com.learnhub.backend.modules.category.repositories.categoryRepository;
import com.learnhub.backend.modules.category.services.CategoryImageStorage;
import com.learnhub.backend.modules.category.services.interfaces.CategoryServicesInterfaces;
import com.learnhub.backend.modules.user.exceptions.AuthException;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;
import com.learnhub.backend.services.BaseServices;

@Service
public class CategoryServices extends BaseServices implements CategoryServicesInterfaces {
    private final categoryRepository categories;
    private final UserServicesInterfaces userServices;
    private final CategoryImageStorage images;

    public CategoryServices(
            categoryRepository categories,
            UserServicesInterfaces userServices,
            CategoryImageStorage images) {
        this.categories = categories;
        this.userServices = userServices;
        this.images = images;
    }

    @Override
    @Transactional(readOnly = true)
    public List<categoryDTO> listActive() {
        return categories.findByStatusTrueOrderByIdAsc().stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<categoryDTO> listAll(String authorization) {
        userServices.requireAdmin(authorization);
        return categories.findAllByOrderByIdAsc().stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public categoryDTO findById(String authorization, Long id) {
        userServices.requireAdmin(authorization);
        return toDto(requireCategory(id));
    }

    @Override
    @Transactional
    public categoryDTO create(String authorization, CategoryRequest request, MultipartFile image) {
        userServices.requireAdmin(authorization);
        Category item = new Category();
        apply(item, request, images.save(image), true);
        categories.save(item);
        return toDto(item);
    }

    @Override
    @Transactional
    public categoryDTO update(String authorization, Long id, CategoryRequest request, MultipartFile image) {
        userServices.requireAdmin(authorization);
        Category item = requireCategory(id);
        String imageUrl = item.getImages();
        if (image != null && !image.isEmpty()) {
            String next = images.save(image);
            images.deleteIfOwned(imageUrl);
            imageUrl = next;
        }
        apply(item, request, imageUrl, false);
        categories.save(item);
        return toDto(item);
    }

    @Override
    @Transactional
    public void delete(String authorization, Long id) {
        userServices.requireAdmin(authorization);
        Category item = requireCategory(id);
        images.deleteIfOwned(item.getImages());
        categories.delete(item);
    }

    private Category requireCategory(Long id) {
        return categories.findById(id)
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy danh mục"));
    }

    private void apply(Category item, CategoryRequest request, String imageUrl, boolean requireImage) {
        String name = request.getName() == null ? "" : request.getName().trim();
        if (name.isBlank()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng nhập tên danh mục", "name");
        }
        if (requireImage && (imageUrl == null || imageUrl.isBlank())) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng chọn ảnh danh mục", "image");
        }
        item.setName(name);
        item.setSlug(uniqueSlug(slugify(name), item.getId()));
        item.setImages(imageUrl);
        item.setStatus(request.getStatus() == null || request.getStatus());
    }

    private String slugify(String value) {
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replace('đ', 'd')
                .replace('Đ', 'd')
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        if (normalized.isBlank()) {
            return "danh-muc";
        }
        return normalized;
    }

    private String uniqueSlug(String base, Long excludeId) {
        String slug = base;
        int index = 2;
        while (slugTaken(slug, excludeId)) {
            slug = base + "-" + index;
            index += 1;
        }
        return slug;
    }

    private boolean slugTaken(String slug, Long excludeId) {
        if (excludeId == null) {
            return categories.existsBySlug(slug);
        }
        return categories.existsBySlugAndIdNot(slug, excludeId);
    }

    private categoryDTO toDto(Category item) {
        return new categoryDTO(
                item.getId(),
                item.getName(),
                item.getSlug(),
                item.getImages(),
                item.getStatus(),
                item.getCreatedAt(),
                item.getUpdatedAt());
    }
}
