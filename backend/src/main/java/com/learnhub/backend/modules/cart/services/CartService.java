package com.learnhub.backend.modules.cart.services;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.learnhub.backend.modules.cart.dtos.CartDTO;
import com.learnhub.backend.modules.cart.dtos.CartItemDTO;
import com.learnhub.backend.modules.cart.dtos.CartItemRequest;
import com.learnhub.backend.modules.cart.models.Cart;
import com.learnhub.backend.modules.cart.models.CartItem;
import com.learnhub.backend.modules.cart.repositories.CartItemRepository;
import com.learnhub.backend.modules.cart.repositories.CartRepository;
import com.learnhub.backend.modules.cart.repositories.EnrollmentRepository;
import com.learnhub.backend.modules.instructor.models.Course;
import com.learnhub.backend.modules.instructor.repositories.CourseRepository;
import com.learnhub.backend.modules.user.exceptions.AuthException;
import com.learnhub.backend.modules.user.models.user;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;

@Service
public class CartService {
    private static final String UNAUTH = "Vui lòng đăng nhập hoặc đăng ký để thêm vào giỏ hàng";

    private final CartRepository carts;
    private final CartItemRepository items;
    private final CourseRepository courses;
    private final EnrollmentRepository enrollments;
    private final UserServicesInterfaces userServices;

    public CartService(
            CartRepository carts,
            CartItemRepository items,
            CourseRepository courses,
            EnrollmentRepository enrollments,
            UserServicesInterfaces userServices) {
        this.carts = carts;
        this.items = items;
        this.courses = courses;
        this.enrollments = enrollments;
        this.userServices = userServices;
    }

    @Transactional(readOnly = true)
    public CartDTO getCart(String authorization) {
        user account = requireShopper(authorization);
        Cart cart = carts.findByUserIdAndStatus(account.getId(), "ACTIVE").orElse(null);
        if (cart == null) {
            return emptyCart();
        }
        return toDto(cart);
    }

    @Transactional
    public CartDTO addItem(String authorization, CartItemRequest request) {
        user account = requireShopper(authorization);
        Long courseId = request == null ? null : request.getCourseId();
        if (courseId == null) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng chọn khóa học", "courseId");
        }
        Course course = courses.findById(courseId)
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy khóa học"));
        if (course.getDeletedAt() != null || !"PUBLISHED".equalsIgnoreCase(course.getStatus())) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Khóa học không khả dụng");
        }
        if (enrollments.existsByUserIdAndCourseId(account.getId(), course.getId())) {
            throw new AuthException(HttpStatus.CONFLICT, "Bạn đã sở hữu khóa học này");
        }
        Cart cart = activeCart(account);
        if (items.existsByCartIdAndCourseId(cart.getId(), course.getId())) {
            return toDto(cart);
        }
        CartItem item = new CartItem();
        item.setCart(cart);
        item.setCourse(course);
        item.setUnitPrice(priceOf(course));
        try {
            items.saveAndFlush(item);
        } catch (DataIntegrityViolationException ignored) {
            return toDto(cart);
        }
        cart.setStatus("ACTIVE");
        carts.save(cart);
        return toDto(cart);
    }

    @Transactional
    public CartDTO removeItem(String authorization, Long courseId) {
        user account = requireShopper(authorization);
        if (courseId == null) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng chọn khóa học", "courseId");
        }
        Cart cart = carts.findByUserIdAndStatus(account.getId(), "ACTIVE").orElse(null);
        if (cart == null) {
            return emptyCart();
        }
        items.deleteByCartIdAndCourseId(cart.getId(), courseId);
        cart.setStatus("ACTIVE");
        carts.save(cart);
        return toDto(cart);
    }

    private Cart activeCart(user account) {
        return carts.findByUserIdAndStatus(account.getId(), "ACTIVE").orElseGet(() -> {
            Cart created = new Cart();
            created.setUser(account);
            created.setStatus("ACTIVE");
            return carts.saveAndFlush(created);
        });
    }

    private user requireShopper(String authorization) {
        try {
            return userServices.requireAccount(authorization);
        } catch (AuthException exception) {
            if (exception.getStatus() == HttpStatus.UNAUTHORIZED) {
                throw new AuthException(HttpStatus.UNAUTHORIZED, UNAUTH);
            }
            throw exception;
        }
    }

    private CartDTO toDto(Cart cart) {
        List<CartItem> rows = items.findByCartIdWithCourse(cart.getId());
        List<CartItemDTO> mapped = rows.stream().map(this::toItemDto).toList();
        BigDecimal subtotal = mapped.stream()
                .map(CartItemDTO::getUnitPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        String currency = mapped.isEmpty() ? "VND" : mapped.get(0).getCurrency();
        return new CartDTO(cart.getId(), cart.getStatus(), mapped.size(), subtotal, currency, mapped);
    }

    private CartItemDTO toItemDto(CartItem item) {
        Course course = item.getCourse();
        String instructor = course.getInstructor() == null ? "Giảng viên LearnHub" : course.getInstructor().getFullName();
        BigDecimal price = course.getPrice() == null ? BigDecimal.ZERO : course.getPrice();
        BigDecimal unit = item.getUnitPrice() == null ? price : item.getUnitPrice();
        boolean free = Boolean.TRUE.equals(course.getIsFree()) || price.compareTo(BigDecimal.ZERO) <= 0;
        return new CartItemDTO(
                item.getId(),
                course.getId(),
                course.getTitle(),
                course.getSlug(),
                course.getImages(),
                instructor == null || instructor.isBlank() ? "Giảng viên LearnHub" : instructor,
                unit,
                price,
                course.getCompareAtPrice(),
                course.getCurrency() == null ? "VND" : course.getCurrency(),
                free,
                course.getDurationSeconds(),
                course.getRatingAvg(),
                course.getRatingCount());
    }

    private CartDTO emptyCart() {
        return new CartDTO(null, "ACTIVE", 0, BigDecimal.ZERO, "VND", List.of());
    }

    private BigDecimal priceOf(Course course) {
        if (Boolean.TRUE.equals(course.getIsFree()) || course.getPrice() == null) {
            return BigDecimal.ZERO;
        }
        return course.getPrice();
    }
}
