package com.learnhub.backend.modules.cart.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.learnhub.backend.modules.cart.dtos.BankTransferDTO;
import com.learnhub.backend.modules.cart.dtos.CheckoutDTO;
import com.learnhub.backend.modules.cart.dtos.CheckoutItemDTO;
import com.learnhub.backend.modules.cart.dtos.CheckoutRequest;
import com.learnhub.backend.modules.cart.models.Cart;
import com.learnhub.backend.modules.cart.models.CartItem;
import com.learnhub.backend.modules.cart.models.Enrollment;
import com.learnhub.backend.modules.cart.models.OrderItem;
import com.learnhub.backend.modules.cart.models.Payment;
import com.learnhub.backend.modules.cart.models.ShopOrder;
import com.learnhub.backend.modules.cart.repositories.CartItemRepository;
import com.learnhub.backend.modules.cart.repositories.CartRepository;
import com.learnhub.backend.modules.cart.repositories.EnrollmentRepository;
import com.learnhub.backend.modules.cart.repositories.OrderItemRepository;
import com.learnhub.backend.modules.cart.repositories.PaymentRepository;
import com.learnhub.backend.modules.cart.repositories.ShopOrderRepository;
import com.learnhub.backend.modules.instructor.models.Course;
import com.learnhub.backend.modules.user.exceptions.AuthException;
import com.learnhub.backend.modules.user.models.user;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;

@Service
public class CheckoutService {
    private static final String UNAUTH = "Vui lòng đăng nhập để thanh toán";
    private static final Set<String> PROVIDERS = Set.of("VNPAY", "MOMO", "BANK_TRANSFER");

    private final CartRepository carts;
    private final CartItemRepository cartItems;
    private final ShopOrderRepository orders;
    private final OrderItemRepository orderItems;
    private final PaymentRepository payments;
    private final EnrollmentRepository enrollments;
    private final UserServicesInterfaces userServices;

    public CheckoutService(
            CartRepository carts,
            CartItemRepository cartItems,
            ShopOrderRepository orders,
            OrderItemRepository orderItems,
            PaymentRepository payments,
            EnrollmentRepository enrollments,
            UserServicesInterfaces userServices) {
        this.carts = carts;
        this.cartItems = cartItems;
        this.orders = orders;
        this.orderItems = orderItems;
        this.payments = payments;
        this.enrollments = enrollments;
        this.userServices = userServices;
    }

    @Transactional
    public CheckoutDTO create(String authorization, CheckoutRequest request) {
        user account = requirePayer(authorization);
        String provider = normalizeProvider(request == null ? null : request.getProvider());
        Cart cart = carts.findByUserIdAndStatus(account.getId(), "ACTIVE")
                .orElseThrow(() -> new AuthException(HttpStatus.BAD_REQUEST, "Giỏ hàng của bạn đang trống"));
        List<CartItem> rows = cartItems.findByCartIdWithCourse(cart.getId());
        if (rows.isEmpty()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Giỏ hàng của bạn đang trống");
        }
        for (CartItem row : rows) {
            Course course = row.getCourse();
            if (course.getDeletedAt() != null || !"PUBLISHED".equalsIgnoreCase(course.getStatus())) {
                throw new AuthException(HttpStatus.BAD_REQUEST, "Khóa học không khả dụng");
            }
            if (enrollments.existsByUserIdAndCourseId(account.getId(), course.getId())) {
                throw new AuthException(HttpStatus.CONFLICT, "Bạn đã sở hữu một khóa học trong giỏ");
            }
        }
        BigDecimal subtotal = rows.stream()
                .map(item -> item.getUnitPrice() == null ? BigDecimal.ZERO : item.getUnitPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        String currency = rows.get(0).getCourse().getCurrency();
        if (currency == null || currency.isBlank()) {
            currency = "VND";
        }
        ShopOrder order = new ShopOrder();
        order.setUser(account);
        order.setOrderCode(nextOrderCode());
        order.setSubtotal(subtotal);
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setTotalAmount(subtotal);
        order.setCurrency(currency);
        order.setStatus("PENDING");
        order.setNotes(provider);
        orders.saveAndFlush(order);
        for (CartItem row : rows) {
            Course course = row.getCourse();
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setCourse(course);
            item.setCourseTitle(course.getTitle());
            item.setUnitPrice(row.getUnitPrice() == null ? BigDecimal.ZERO : row.getUnitPrice());
            orderItems.save(item);
        }
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setProvider(provider);
        payment.setAmount(subtotal);
        payment.setCurrency(currency);
        payment.setStatus("PENDING");
        payment.setCheckoutUrl("/thanh-toan/" + order.getOrderCode());
        payment.setProviderTxnId(provider + "-" + order.getOrderCode());
        payments.save(payment);
        cart.setStatus("CHECKED_OUT");
        carts.save(cart);
        return toDto(order, payment);
    }

    @Transactional(readOnly = true)
    public CheckoutDTO get(String authorization, String orderCode) {
        user account = requirePayer(authorization);
        ShopOrder order = requireOrder(account, orderCode);
        Payment payment = payments.findFirstByOrderIdOrderByIdDesc(order.getId())
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy thanh toán"));
        return toDto(order, payment);
    }

    @Transactional
    public CheckoutDTO confirm(String authorization, String orderCode) {
        user account = requirePayer(authorization);
        ShopOrder order = requireOrder(account, orderCode);
        Payment payment = payments.findFirstByOrderIdOrderByIdDesc(order.getId())
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy thanh toán"));
        if ("PAID".equalsIgnoreCase(order.getStatus()) && "SUCCEEDED".equalsIgnoreCase(payment.getStatus())) {
            return toDto(order, payment);
        }
        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Đơn hàng không thể thanh toán");
        }
        LocalDateTime now = LocalDateTime.now();
        order.setStatus("PAID");
        order.setPaidAt(now);
        payment.setStatus("SUCCEEDED");
        payment.setPaidAt(now);
        orders.save(order);
        payments.save(payment);
        List<OrderItem> items = orderItems.findByOrderIdWithCourse(order.getId());
        for (OrderItem item : items) {
            if (enrollments.existsByUserIdAndCourseId(account.getId(), item.getCourse().getId())) {
                continue;
            }
            Enrollment enrollment = new Enrollment();
            enrollment.setUserId(account.getId());
            enrollment.setCourseId(item.getCourse().getId());
            enrollment.setOrderId(order.getId());
            enrollment.setSource("PURCHASE");
            enrollment.setStatus("ACTIVE");
            enrollments.save(enrollment);
        }
        return toDto(order, payment);
    }

    private ShopOrder requireOrder(user account, String orderCode) {
        if (orderCode == null || orderCode.isBlank()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Thiếu mã đơn hàng");
        }
        ShopOrder order = orders.findByOrderCode(orderCode.trim())
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));
        if (!order.getUser().getId().equals(account.getId())) {
            throw new AuthException(HttpStatus.FORBIDDEN, "Bạn không thể xem đơn hàng này");
        }
        return order;
    }

    private user requirePayer(String authorization) {
        try {
            return userServices.requireAccount(authorization);
        } catch (AuthException exception) {
            if (exception.getStatus() == HttpStatus.UNAUTHORIZED) {
                throw new AuthException(HttpStatus.UNAUTHORIZED, UNAUTH);
            }
            throw exception;
        }
    }

    private String normalizeProvider(String raw) {
        String provider = raw == null ? "" : raw.trim().toUpperCase(Locale.ROOT);
        if (!PROVIDERS.contains(provider)) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng chọn VNPay, MoMo hoặc chuyển khoản ngân hàng", "provider");
        }
        return provider;
    }

    private String nextOrderCode() {
        for (int attempt = 0; attempt < 8; attempt += 1) {
            String code = "LH" + System.currentTimeMillis() + ThreadLocalRandom.current().nextInt(10, 99);
            if (!orders.existsByOrderCode(code)) {
                return code;
            }
        }
        return "LH" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase(Locale.ROOT);
    }

    private CheckoutDTO toDto(ShopOrder order, Payment payment) {
        List<CheckoutItemDTO> items = orderItems.findByOrderIdWithCourse(order.getId()).stream()
                .map(this::toItemDto)
                .toList();
        BankTransferDTO bank = null;
        if ("BANK_TRANSFER".equalsIgnoreCase(payment.getProvider())) {
            bank = new BankTransferDTO(
                    "Vietcombank",
                    "CONG TY LEARNHUB",
                    "0123456789012",
                    order.getOrderCode());
        }
        return new CheckoutDTO(
                order.getId(),
                order.getOrderCode(),
                order.getStatus(),
                payment.getProvider(),
                payment.getStatus(),
                order.getSubtotal(),
                order.getTotalAmount(),
                order.getCurrency(),
                payment.getCheckoutUrl(),
                bank,
                items);
    }

    private CheckoutItemDTO toItemDto(OrderItem item) {
        Course course = item.getCourse();
        String instructor = course.getInstructor() == null ? "Giảng viên LearnHub" : course.getInstructor().getFullName();
        return new CheckoutItemDTO(
                course.getId(),
                item.getCourseTitle(),
                course.getSlug(),
                course.getImages(),
                instructor == null || instructor.isBlank() ? "Giảng viên LearnHub" : instructor,
                item.getUnitPrice());
    }
}
