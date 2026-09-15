package com.learnhub.backend.modules.news.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.learnhub.backend.modules.news.dtos.NewsBlogDTO;
import com.learnhub.backend.modules.news.dtos.NewsBlogRequest;
import com.learnhub.backend.modules.news.dtos.NewsDTO;
import com.learnhub.backend.modules.news.dtos.NewsRequest;
import com.learnhub.backend.modules.news.models.News;
import com.learnhub.backend.modules.news.models.NewsBlog;
import com.learnhub.backend.modules.news.repositories.NewsBlogRepository;
import com.learnhub.backend.modules.news.repositories.NewsRepository;
import com.learnhub.backend.modules.user.exceptions.AuthException;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;

@Service
public class NewsServices {
    private final NewsRepository news;
    private final NewsBlogRepository blogs;
    private final NewsImageStorage images;
    private final UserServicesInterfaces userServices;

    public NewsServices(
            NewsRepository news,
            NewsBlogRepository blogs,
            NewsImageStorage images,
            UserServicesInterfaces userServices) {
        this.news = news;
        this.blogs = blogs;
        this.images = images;
        this.userServices = userServices;
    }

    @Transactional(readOnly = true)
    public List<NewsDTO> listActiveNews() {
        return news.findByIsActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::toNewsDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NewsDTO> listAllNews(String authorization) {
        userServices.requireAdmin(authorization);
        return news.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toNewsDto)
                .toList();
    }

    @Transactional
    public NewsDTO createNews(String authorization, NewsRequest request, MultipartFile image) {
        userServices.requireAdmin(authorization);
        News item = new News();
        applyNews(item, request, images.save(image, "news"), image, true);
        news.save(item);
        return toNewsDto(item);
    }

    @Transactional
    public NewsDTO updateNews(String authorization, Long id, NewsRequest request, MultipartFile image) {
        userServices.requireAdmin(authorization);
        News item = requireNews(id);
        String imageUrl = item.getImageUrl();
        MultipartFile nextImage = null;
        if (image != null && !image.isEmpty()) {
            String next = images.save(image, "news");
            images.deleteIfOwned(imageUrl, "news");
            imageUrl = next;
            nextImage = image;
        }
        applyNews(item, request, imageUrl, nextImage, false);
        news.save(item);
        return toNewsDto(item);
    }

    @Transactional
    public void deleteNews(String authorization, Long id) {
        userServices.requireAdmin(authorization);
        News item = requireNews(id);
        images.deleteIfOwned(item.getImageUrl(), "news");
        news.delete(item);
    }

    @Transactional(readOnly = true)
    public List<NewsBlogDTO> listPublishedBlogs() {
        return blogs.findByIsActiveTrueAndPublishedAtLessThanEqualOrderByPublishedAtDesc(LocalDateTime.now())
                .stream()
                .map(this::toBlogDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public NewsBlogDTO findPublishedBlog(String slug) {
        return blogs.findBySlugAndIsActiveTrueAndPublishedAtLessThanEqual(slug, LocalDateTime.now())
                .map(this::toBlogDto)
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy bài viết"));
    }

    @Transactional(readOnly = true)
    public List<NewsBlogDTO> listAllBlogs(String authorization) {
        userServices.requireAdmin(authorization);
        return blogs.findAllByOrderByPublishedAtDesc().stream()
                .map(this::toBlogDto)
                .toList();
    }

    @Transactional
    public NewsBlogDTO createBlog(String authorization, NewsBlogRequest request, MultipartFile image) {
        userServices.requireAdmin(authorization);
        NewsBlog item = new NewsBlog();
        applyBlog(item, request, images.save(image, "newsblogs"), true);
        blogs.save(item);
        return toBlogDto(item);
    }

    @Transactional
    public NewsBlogDTO updateBlog(String authorization, Long id, NewsBlogRequest request, MultipartFile image) {
        userServices.requireAdmin(authorization);
        NewsBlog item = requireBlog(id);
        String imageUrl = item.getImageUrl();
        if (image != null && !image.isEmpty()) {
            String next = images.save(image, "newsblogs");
            images.deleteIfOwned(imageUrl, "newsblogs");
            imageUrl = next;
        }
        applyBlog(item, request, imageUrl, false);
        blogs.save(item);
        return toBlogDto(item);
    }

    @Transactional
    public void deleteBlog(String authorization, Long id) {
        userServices.requireAdmin(authorization);
        NewsBlog item = requireBlog(id);
        images.deleteIfOwned(item.getImageUrl(), "newsblogs");
        blogs.delete(item);
    }

    private News requireNews(Long id) {
        return news.findById(id)
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy tin nổi bật"));
    }

    private NewsBlog requireBlog(Long id) {
        return blogs.findById(id)
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy bài viết"));
    }

    private void applyNews(News item, NewsRequest request, String imageUrl, MultipartFile image, boolean requireImage) {
        String title = request.getTitle() == null ? "" : request.getTitle().trim();
        if (title.isBlank() && image != null && image.getOriginalFilename() != null) {
            title = titleFromFilename(image.getOriginalFilename());
        }
        if (title.isBlank()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng chọn ảnh tin nổi bật", "image");
        }
        if (requireImage && (imageUrl == null || imageUrl.isBlank())) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng chọn ảnh tin nổi bật", "image");
        }
        item.setTitle(title);
        item.setImageUrl(imageUrl);
        item.setIsActive(request.getIsActive() == null || request.getIsActive());
    }

    private void applyBlog(NewsBlog item, NewsBlogRequest request, String imageUrl, boolean requireImage) {
        String title = request.getTitle() == null ? "" : request.getTitle().trim();
        if (title.isBlank()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng nhập tiêu đề", "title");
        }
        String excerpt = request.getExcerpt() == null ? "" : request.getExcerpt().trim();
        if (excerpt.isBlank()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng nhập nội dung", "excerpt");
        }
        if (requireImage && (imageUrl == null || imageUrl.isBlank())) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng chọn ảnh bài viết", "image");
        }
        item.setTitle(title);
        item.setSlug(uniqueSlug(slugify(title), item.getId()));
        item.setExcerpt(excerpt);
        item.setImageUrl(imageUrl);
        item.setIsActive(request.getIsActive() == null || request.getIsActive());
        item.setPublishedAt(parsePublishedAt(request.getPublishedAt()));
    }

    private LocalDateTime parsePublishedAt(String value) {
        if (value == null || value.isBlank()) {
            return LocalDateTime.now();
        }
        try {
            return LocalDate.parse(value.trim()).atTime(LocalTime.now());
        } catch (DateTimeParseException ignored) {
        }
        try {
            return LocalDateTime.parse(value.trim());
        } catch (DateTimeParseException exception) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Ngày đăng không hợp lệ", "publishedAt");
        }
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
            return "bai-viet";
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
            return blogs.existsBySlug(slug);
        }
        return blogs.existsBySlugAndIdNot(slug, excludeId);
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

    private NewsDTO toNewsDto(News item) {
        return new NewsDTO(
                item.getId(),
                item.getTitle(),
                item.getImageUrl(),
                item.getIsActive(),
                item.getCreatedAt(),
                item.getUpdatedAt());
    }

    private NewsBlogDTO toBlogDto(NewsBlog item) {
        return new NewsBlogDTO(
                item.getId(),
                item.getTitle(),
                item.getSlug(),
                item.getExcerpt(),
                item.getImageUrl(),
                item.getIsActive(),
                item.getPublishedAt(),
                item.getCreatedAt(),
                item.getUpdatedAt());
    }
}
