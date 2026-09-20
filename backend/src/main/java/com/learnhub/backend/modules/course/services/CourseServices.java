package com.learnhub.backend.modules.course.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnhub.backend.modules.category.models.Category;
import com.learnhub.backend.modules.category.repositories.categoryRepository;
import com.learnhub.backend.modules.course.dtos.AdminCourseRequest;
import com.learnhub.backend.modules.course.dtos.CourseAdminDTO;
import com.learnhub.backend.modules.course.dtos.CourseInstructorOptionDTO;
import com.learnhub.backend.modules.course.support.SlugUtils;
import com.learnhub.backend.modules.instructor.models.Course;
import com.learnhub.backend.modules.instructor.repositories.CourseRepository;
import com.learnhub.backend.modules.user.exceptions.AuthException;
import com.learnhub.backend.modules.user.models.UserRole;
import com.learnhub.backend.modules.user.models.user;
import com.learnhub.backend.modules.user.repositories.userRepository;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;

@Service
public class CourseServices {
    private static final Set<String> STATUSES = Set.of("DRAFT", "PUBLISHED", "ARCHIVED");
    private static final Set<String> LEVELS = Set.of("ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED");
    private static final Set<String> LANGUAGES = Set.of("vi", "en");
    private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() {
    };

    private final CourseRepository courses;
    private final categoryRepository categories;
    private final userRepository users;
    private final CourseImageStorage images;
    private final CourseVideoStorage videos;
    private final UserServicesInterfaces userServices;
    private final ObjectMapper mapper = new ObjectMapper();

    public CourseServices(
            CourseRepository courses,
            categoryRepository categories,
            userRepository users,
            CourseImageStorage images,
            CourseVideoStorage videos,
            UserServicesInterfaces userServices) {
        this.courses = courses;
        this.categories = categories;
        this.users = users;
        this.images = images;
        this.videos = videos;
        this.userServices = userServices;
    }

    @Transactional(readOnly = true)
    public List<CourseAdminDTO> listPublished() {
        return courses.findByDeletedAtIsNullAndStatusOrderByPublishedAtDesc("PUBLISHED").stream()
                .map(this::toAdminDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseAdminDTO findPublished(String slug) {
        return courses.findBySlugAndDeletedAtIsNull(slug)
                .filter(item -> "PUBLISHED".equals(item.getStatus()))
                .map(this::toAdminDto)
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy khóa học"));
    }

    @Transactional(readOnly = true)
    public List<CourseAdminDTO> listAll(String authorization) {
        userServices.requireAdmin(authorization);
        return courses.findByDeletedAtIsNullOrderByCreatedAtDesc().stream()
                .map(this::toAdminDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CourseInstructorOptionDTO> listInstructors(String authorization) {
        userServices.requireAdmin(authorization);
        return users.findAll().stream()
                .filter(account -> account.getDeletedAt() == null)
                .filter(account -> {
                    UserRole role = UserRole.from(account.getRole());
                    return role == UserRole.INSTRUCTOR || role == UserRole.ADMIN;
                })
                .map(account -> new CourseInstructorOptionDTO(
                        account.getId(),
                        account.getFullName() == null || account.getFullName().isBlank()
                                ? account.getEmail()
                                : account.getFullName(),
                        account.getEmail()))
                .toList();
    }

    @Transactional
    public CourseAdminDTO create(String authorization, AdminCourseRequest request, MultipartFile image) {
        user admin = requireAdminAccount(authorization);
        Course item = new Course();
        apply(item, request, images.save(image), true, admin);
        courses.save(item);
        return toAdminDto(item);
    }

    @Transactional
    public CourseAdminDTO update(String authorization, Long id, AdminCourseRequest request, MultipartFile image) {
        user admin = requireAdminAccount(authorization);
        Course item = requireCourse(id);
        String imageUrl = item.getImages();
        if (image != null && !image.isEmpty()) {
            String next = images.save(image);
            images.deleteIfOwned(imageUrl);
            imageUrl = next;
        }
        apply(item, request, imageUrl, false, admin);
        courses.save(item);
        return toAdminDto(item);
    }

    @Transactional
    public void delete(String authorization, Long id) {
        userServices.requireAdmin(authorization);
        Course item = requireCourse(id);
        images.deleteIfOwned(item.getImages());
        videos.deleteIfOwned(item.getPreviewVideo());
        item.setDeletedAt(LocalDateTime.now());
        item.setStatus("ARCHIVED");
        courses.save(item);
    }

    private void apply(
            Course item,
            AdminCourseRequest request,
            String imageUrl,
            boolean creating,
            user admin) {
        if (request == null) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Thiếu dữ liệu khóa học");
        }
        String title = request.getTitle() == null ? "" : request.getTitle().trim();
        if (title.isBlank()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng nhập tên khóa học", "title");
        }
        if (creating && (imageUrl == null || imageUrl.isBlank())) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng chọn ảnh khóa học", "image");
        }
        item.setInstructor(resolveInstructor(request.getInstructorId(), admin));
        item.setCategory(resolveCategory(request.getCategoryId()));
        item.setImages(imageUrl);
        item.setTitle(title);
        item.setSlug(uniqueSlug(SlugUtils.slugify(title, "khoa-hoc"), item.getId()));
        item.setSubtitle(trimToNull(request.getSubtitle()));
        item.setDescription(trimToEmpty(request.getDescription()));
        item.setLanguage(normalizeSet(request.getLanguage(), LANGUAGES, "vi", "Ngôn ngữ không hợp lệ", "language"));
        item.setLevel(normalizeSet(request.getLevel(), LEVELS, "ALL", "Cấp độ không hợp lệ", "level"));
        String status = normalizeSet(request.getStatus(), STATUSES, "DRAFT", "Trạng thái không hợp lệ", "status");
        item.setStatus(status);
        if ("PUBLISHED".equals(status) && item.getPublishedAt() == null) {
            item.setPublishedAt(LocalDateTime.now());
        }
        boolean isFree = request.getIsFree() == null || request.getIsFree();
        item.setIsFree(isFree);
        item.setPrice(isFree ? BigDecimal.ZERO : parseMoney(request.getPrice(), "price"));
        item.setCompareAtPrice(parseOptionalMoney(request.getCompareAtPrice(), "compareAtPrice"));
        String currency = request.getCurrency() == null || request.getCurrency().isBlank()
                ? "VND"
                : request.getCurrency().trim().toUpperCase();
        if (currency.length() != 3) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Mã tiền tệ không hợp lệ", "currency");
        }
        item.setCurrency(currency);
        item.setIssuesCertificate(request.getIssuesCertificate() != null && request.getIssuesCertificate());
        if (request.getDurationSeconds() != null && request.getDurationSeconds() >= 0) {
            item.setDurationSeconds(request.getDurationSeconds());
        }
        item.setWhatYouWillLearn(toJsonList(request.getWhatYouWillLearn()));
        item.setRequirements(toJsonList(request.getRequirements()));
        applyPreviewVideo(item, request.getPreviewVideo(), creating);
    }

    private void applyPreviewVideo(Course item, String nextVideo, boolean creating) {
        if (creating) {
            if (nextVideo != null && !nextVideo.isBlank()) {
                item.setPreviewVideo(nextVideo.trim());
            }
            return;
        }
        if (nextVideo == null) {
            return;
        }
        String trimmed = nextVideo.trim();
        if (trimmed.isBlank()) {
            videos.deleteIfOwned(item.getPreviewVideo());
            item.setPreviewVideo(null);
            return;
        }
        if (!trimmed.equals(item.getPreviewVideo())) {
            videos.deleteIfOwned(item.getPreviewVideo());
        }
        item.setPreviewVideo(trimmed);
    }

    private user resolveInstructor(Long instructorId, user admin) {
        if (instructorId == null) {
            return admin;
        }
        user account = users.findById(instructorId)
                .orElseThrow(() -> new AuthException(HttpStatus.BAD_REQUEST, "Không tìm thấy giảng viên", "instructorId"));
        if (account.getDeletedAt() != null) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Giảng viên không khả dụng", "instructorId");
        }
        UserRole role = UserRole.from(account.getRole());
        if (role != UserRole.INSTRUCTOR && role != UserRole.ADMIN) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Tài khoản không phải giảng viên", "instructorId");
        }
        return account;
    }

    private Category resolveCategory(Long categoryId) {
        if (categoryId == null) {
            return null;
        }
        return categories.findById(categoryId)
                .orElseThrow(() -> new AuthException(HttpStatus.BAD_REQUEST, "Không tìm thấy danh mục", "categoryId"));
    }

    private Course requireCourse(Long id) {
        Course item = courses.findById(id)
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy khóa học"));
        if (item.getDeletedAt() != null) {
            throw new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy khóa học");
        }
        return item;
    }

    private user requireAdminAccount(String authorization) {
        return users.findById(userServices.requireAdmin(authorization).getId())
                .orElseThrow(() -> new AuthException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ"));
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
            return courses.existsBySlug(slug);
        }
        return courses.existsBySlugAndIdNot(slug, excludeId);
    }

    private BigDecimal parseMoney(String value, String field) {
        if (value == null || value.isBlank()) {
            return BigDecimal.ZERO;
        }
        try {
            BigDecimal amount = new BigDecimal(value.trim());
            if (amount.signum() < 0) {
                throw new AuthException(HttpStatus.BAD_REQUEST, "Giá không hợp lệ", field);
            }
            return amount;
        } catch (NumberFormatException exception) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Giá không hợp lệ", field);
        }
    }

    private BigDecimal parseOptionalMoney(String value, String field) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return parseMoney(value, field);
    }

    private String normalizeSet(String value, Set<String> allowed, String fallback, String message, String field) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        String normalized = value.trim().toUpperCase();
        if (allowed.contains(value.trim())) {
            return value.trim();
        }
        if (allowed.contains(normalized)) {
            return normalized;
        }
        if (allowed.contains(value.trim().toLowerCase())) {
            return value.trim().toLowerCase();
        }
        throw new AuthException(HttpStatus.BAD_REQUEST, message, field);
    }

    private String toJsonList(String raw) {
        List<String> items = new ArrayList<>();
        if (raw != null && !raw.isBlank()) {
            String trimmed = raw.trim();
            if (trimmed.startsWith("[")) {
                try {
                    items.addAll(mapper.readValue(trimmed, STRING_LIST));
                } catch (JsonProcessingException ignored) {
                    splitLines(trimmed, items);
                }
            } else {
                splitLines(trimmed, items);
            }
        }
        try {
            return mapper.writeValueAsString(items.stream().map(String::trim).filter(item -> !item.isBlank()).toList());
        } catch (JsonProcessingException ignored) {
            return "[]";
        }
    }

    private void splitLines(String raw, List<String> items) {
        for (String line : raw.split("\\r?\\n")) {
            if (!line.isBlank()) {
                items.add(line.trim());
            }
        }
    }

    private List<String> fromJsonList(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        try {
            List<String> items = mapper.readValue(raw, STRING_LIST);
            return items == null ? List.of() : items;
        } catch (JsonProcessingException ignored) {
            return List.of();
        }
    }

    private CourseAdminDTO toAdminDto(Course item) {
        user instructor = item.getInstructor();
        Category category = item.getCategory();
        return new CourseAdminDTO(
                item.getId(),
                instructor == null ? null : instructor.getId(),
                instructor == null
                        ? ""
                        : (instructor.getFullName() == null || instructor.getFullName().isBlank()
                                ? instructor.getEmail()
                                : instructor.getFullName()),
                category == null ? null : category.getId(),
                category == null ? "" : category.getName(),
                item.getImages(),
                item.getPreviewVideo(),
                item.getTitle(),
                item.getSlug(),
                item.getSubtitle(),
                item.getDescription(),
                item.getLanguage(),
                item.getLevel(),
                item.getStatus(),
                item.getPrice(),
                item.getCompareAtPrice(),
                item.getCurrency(),
                item.getIsFree(),
                item.getIssuesCertificate(),
                item.getDurationSeconds(),
                item.getEnrolledCount(),
                item.getRatingAvg(),
                item.getRatingCount(),
                fromJsonList(item.getWhatYouWillLearn()),
                fromJsonList(item.getRequirements()),
                item.getPublishedAt(),
                item.getCreatedAt(),
                item.getUpdatedAt());
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }
}
