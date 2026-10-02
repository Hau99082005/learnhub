package com.learnhub.backend.modules.cart.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.learnhub.backend.config.SePayProperties;
import com.learnhub.backend.modules.cart.dtos.BankTransferDTO;
import com.learnhub.backend.modules.cart.dtos.CheckoutDTO;
import com.learnhub.backend.modules.cart.dtos.CheckoutItemDTO;
import com.learnhub.backend.modules.cart.dtos.CheckoutRequest;
import com.learnhub.backend.modules.cart.dtos.SePayWebhookPayload;
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
    private static final Pattern ORDER_CODE = Pattern.compile("LH[0-9A-Z]+", Pattern.CASE_INSENSITIVE);
    private final ConcurrentHashMap<String, Long> lastReconcile = new ConcurrentHashMap<>();

    private final CartRepository carts;
    private final CartItemRepository cartItems;
    private final ShopOrderRepository orders;
    private final OrderItemRepository orderItems;
    private final PaymentRepository payments;
    private final EnrollmentRepository enrollments;
    private final UserServicesInterfaces userServices;
    private final SePayProperties sePayProperties;
    private final SePayTransactionClient sePayTransactions;

    public CheckoutService(
            CartRepository carts,
            CartItemRepository cartItems,
            ShopOrderRepository orders,
            OrderItemRepository orderItems,
            PaymentRepository payments,
            EnrollmentRepository enrollments,
            UserServicesInterfaces userServices,
            SePayProperties sePayProperties,
            SePayTransactionClient sePayTransactions) {
        this.carts = carts;
        this.cartItems = cartItems;
        this.orders = orders;
        this.orderItems = orderItems;
        this.payments = payments;
        this.enrollments = enrollments;
        this.userServices = userServices;
        this.sePayProperties = sePayProperties;
        this.sePayTransactions = sePayTransactions;
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

    @Transactional
    public CheckoutDTO get(String authorization, String orderCode) {
        user account = requirePayer(authorization);
        ShopOrder order = requireOrder(account, orderCode);
        Payment payment = payments.findFirstByOrderIdOrderByIdDesc(order.getId())
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy thanh toán"));
        if ("PENDING".equalsIgnoreCase(order.getStatus())
                && "BANK_TRANSFER".equalsIgnoreCase(payment.getProvider())) {
            reconcileFromSePay(order, payment);
        }
        return toDto(order, payment);
    }

    @Transactional
    public CheckoutDTO confirm(String authorization, String orderCode) {
        user account = requirePayer(authorization);
        ShopOrder order = requireOrder(account, orderCode);
        Payment payment = payments.findFirstByOrderIdOrderByIdDesc(order.getId())
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy thanh toán"));
        settlePaid(order, payment, payment.getProviderTxnId());
        return toDto(order, payment);
    }

    @Transactional
    public boolean handleSePayWebhook(String authorization, SePayWebhookPayload payload) {
        if (!sePayAuthorized(authorization)) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Webhook SePay không hợp lệ");
        }
        if (payload == null) {
            return true;
        }
        if (payload.getTransferType() != null && !payload.getTransferType().isBlank()
                && !"in".equalsIgnoreCase(payload.getTransferType().trim())) {
            return true;
        }
        String txnId = payload.getId() == null || payload.getId() <= 0 ? "" : "SEPAY-" + payload.getId();
        if (!txnId.isBlank() && payments.existsByProviderTxnId(txnId)) {
            return true;
        }
        String orderCode = extractSePayOrderCode(payload);
        if (orderCode == null || orderCode.isBlank()) {
            return true;
        }
        Optional<ShopOrder> found = orders.findByOrderCode(orderCode);
        if (found.isEmpty()) {
            found = orders.findByOrderCode(orderCode.toUpperCase(Locale.ROOT));
        }
        if (found.isEmpty()) {
            return true;
        }
        ShopOrder order = found.get();
        Payment payment = payments.findFirstByOrderIdOrderByIdDesc(order.getId()).orElse(null);
        if (payment == null) {
            return true;
        }
        BigDecimal paid = payload.getTransferAmount() == null ? BigDecimal.ZERO : payload.getTransferAmount();
        BigDecimal due = order.getTotalAmount() == null ? BigDecimal.ZERO : order.getTotalAmount();
        if (paid.setScale(0, RoundingMode.DOWN).compareTo(due.setScale(0, RoundingMode.DOWN)) < 0) {
            return true;
        }
        settlePaid(order, payment, txnId.isBlank() ? payment.getProviderTxnId() : txnId);
        return true;
    }

    private void reconcileFromSePay(ShopOrder order, Payment payment) {
        String code = order.getOrderCode();
        long now = System.currentTimeMillis();
        Long previous = lastReconcile.get(code);
        if (previous != null && now - previous < 400) {
            return;
        }
        lastReconcile.put(code, now);
        sePayTransactions.findPaidTransactionId(code, order.getTotalAmount()).ifPresent((txnId) -> {
            if (!payments.existsByProviderTxnId(txnId)) {
                settlePaid(order, payment, txnId);
            }
        });
    }

    private void settlePaid(ShopOrder order, Payment payment, String providerTxnId) {
        if ("PAID".equalsIgnoreCase(order.getStatus()) && "SUCCEEDED".equalsIgnoreCase(payment.getStatus())) {
            return;
        }
        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Đơn hàng không thể thanh toán");
        }
        LocalDateTime now = LocalDateTime.now();
        order.setStatus("PAID");
        order.setPaidAt(now);
        payment.setStatus("SUCCEEDED");
        payment.setPaidAt(now);
        if (providerTxnId != null && !providerTxnId.isBlank()) {
            payment.setProviderTxnId(providerTxnId);
        }
        orders.save(order);
        payments.save(payment);
        user account = order.getUser();
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

    private boolean sePayAuthorized(String authorization) {
        String expected = firstNonBlank(sePayProperties.getWebhookApiKey(), sePayProperties.getApiToken());
        String provided = extractSePayKey(authorization);
        if (expected.isEmpty() || provided.isEmpty()) {
            return false;
        }
        byte[] left = expected.getBytes(StandardCharsets.UTF_8);
        byte[] right = provided.getBytes(StandardCharsets.UTF_8);
        return left.length == right.length && MessageDigest.isEqual(left, right);
    }

    private String extractSePayKey(String authorization) {
        if (authorization == null) {
            return "";
        }
        String value = authorization.trim();
        if (value.regionMatches(true, 0, "Apikey ", 0, 7)) {
            return value.substring(7).trim();
        }
        if (value.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return value.substring(7).trim();
        }
        return value;
    }

    private String extractSePayOrderCode(SePayWebhookPayload payload) {
        String code = payload.getCode() == null ? "" : payload.getCode().trim();
        if (!code.isBlank()) {
            Matcher direct = ORDER_CODE.matcher(code);
            if (direct.find()) {
                return direct.group().toUpperCase(Locale.ROOT);
            }
            return code;
        }
        String blob = ((payload.getContent() == null ? "" : payload.getContent()) + " "
                + (payload.getDescription() == null ? "" : payload.getDescription()));
        Matcher matcher = ORDER_CODE.matcher(blob);
        return matcher.find() ? matcher.group().toUpperCase(Locale.ROOT) : "";
    }

    private String firstNonBlank(String... values) {
        if (values == null) {
            return "";
        }
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return "";
    }

    private String qrUrl(ShopOrder order) {
        String acc = sePayProperties.getAccountNumber();
        String bank = sePayProperties.getBank();
        if (acc == null || acc.isBlank() || bank == null || bank.isBlank()) {
            return "";
        }
        String amount = order.getTotalAmount() == null
                ? "0"
                : order.getTotalAmount().setScale(0, RoundingMode.DOWN).toPlainString();
        String base = sePayProperties.getQrUrl();
        return base
                + "?acc=" + encode(acc)
                + "&bank=" + encode(bank)
                + "&amount=" + encode(amount)
                + "&des=" + encode(order.getOrderCode())
                + "&template=compact";
    }

    private String encode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }

    private CheckoutDTO toDto(ShopOrder order, Payment payment) {
        List<CheckoutItemDTO> items = orderItems.findByOrderIdWithCourse(order.getId()).stream()
                .map(this::toItemDto)
                .toList();
        BankTransferDTO bank = null;
        if ("BANK_TRANSFER".equalsIgnoreCase(payment.getProvider())) {
            String bankName = firstNonBlank(sePayProperties.getBank(), "MBBank");
            String accountName = firstNonBlank(sePayProperties.getAccountName(), "LE VAN HAU");
            String accountNumber = firstNonBlank(sePayProperties.getAccountNumber(), "");
            bank = new BankTransferDTO(
                    bankName,
                    accountName,
                    accountNumber,
                    order.getOrderCode(),
                    qrUrl(order));
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
