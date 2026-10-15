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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.learnhub.backend.config.SePayProperties;
import com.learnhub.backend.modules.cart.dtos.BankTransferDTO;
import com.learnhub.backend.modules.cart.dtos.CheckoutDTO;
import com.learnhub.backend.modules.cart.dtos.CheckoutItemDTO;
import com.learnhub.backend.modules.cart.dtos.CheckoutRequest;
import com.learnhub.backend.modules.cart.dtos.PurchaseHistoryDTO;
import com.learnhub.backend.modules.cart.dtos.SePayGatewayDTO;
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
import com.learnhub.backend.modules.coupon.services.CouponService;
import com.learnhub.backend.modules.instructor.models.Course;
import com.learnhub.backend.modules.instructor.models.InstructorBankAccount;
import com.learnhub.backend.modules.instructor.repositories.InstructorBankAccountRepository;
import com.learnhub.backend.modules.instructor.support.VnBanks;
import com.learnhub.backend.modules.notify.models.NotificationJob;
import com.learnhub.backend.modules.notify.services.NotificationQueue;
import com.learnhub.backend.modules.user.exceptions.AuthException;
import com.learnhub.backend.modules.user.models.user;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;

@Service
public class CheckoutService {
    private static final String UNAUTH = "Vui lòng đăng nhập để thanh toán";
    private static final Set<String> PROVIDERS = Set.of("VNPAY", "MOMO", "BANK_TRANSFER");
    private static final Pattern ORDER_CODE = Pattern.compile("(?:GV\\d+|LH)[0-9A-Z]+", Pattern.CASE_INSENSITIVE);

    private final CartRepository carts;
    private final CartItemRepository cartItems;
    private final ShopOrderRepository orders;
    private final OrderItemRepository orderItems;
    private final PaymentRepository payments;
    private final EnrollmentRepository enrollments;
    private final UserServicesInterfaces userServices;
    private final CouponService couponService;
    private final NotificationQueue notificationQueue;
    private final SePayProperties sePayProperties;
    private final SePayTransactionClient sePayTransactions;
    private final SePayGatewayClient sePayGateway;
    private final InstructorBankAccountRepository instructorBanks;

    public CheckoutService(
            CartRepository carts,
            CartItemRepository cartItems,
            ShopOrderRepository orders,
            OrderItemRepository orderItems,
            PaymentRepository payments,
            EnrollmentRepository enrollments,
            UserServicesInterfaces userServices,
            CouponService couponService,
            NotificationQueue notificationQueue,
            SePayProperties sePayProperties,
            SePayTransactionClient sePayTransactions,
            SePayGatewayClient sePayGateway,
            InstructorBankAccountRepository instructorBanks) {
        this.carts = carts;
        this.cartItems = cartItems;
        this.orders = orders;
        this.orderItems = orderItems;
        this.payments = payments;
        this.enrollments = enrollments;
        this.userServices = userServices;
        this.couponService = couponService;
        this.notificationQueue = notificationQueue;
        this.sePayProperties = sePayProperties;
        this.sePayTransactions = sePayTransactions;
        this.sePayGateway = sePayGateway;
        this.instructorBanks = instructorBanks;
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
        List<Course> courseList = rows.stream().map(CartItem::getCourse).toList();
        for (CartItem row : rows) {
            Course course = row.getCourse();
            if (course.getDeletedAt() != null || !"PUBLISHED".equalsIgnoreCase(course.getStatus())) {
                throw new AuthException(HttpStatus.BAD_REQUEST, "Khóa học không khả dụng");
            }
            if (enrollments.existsByUserIdAndCourseId(account.getId(), course.getId())) {
                CheckoutDTO owned = latestOwnedCheckout(account, course.getId());
                if (owned != null) {
                    return owned;
                }
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
        order.setOrderCode(nextOrderCode(singleInstructorId(courseList)));
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
        String couponCode = request == null ? null : request.getCouponCode();
        if (couponCode != null && !couponCode.isBlank()) {
            couponService.applyToOrder(order, account.getId(), couponCode, rows);
            orders.saveAndFlush(order);
        }
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setProvider(provider);
        payment.setAmount(order.getTotalAmount());
        payment.setCurrency(currency);
        payment.setStatus("PENDING");
        payment.setCheckoutUrl("/thanh-toan/" + order.getOrderCode());
        payment.setProviderTxnId(provider + "-" + order.getOrderCode());
        applyPayee(payment, courseList);
        payments.save(payment);
        Payee createdPayee = resolvePayee(courseList);
        if (createdPayee.instructorId() != null
                && filled(createdPayee.accountNumber())
                && !filled(createdPayee.sepayAccountId())) {
            instructorBanks.findByUser_Id(createdPayee.instructorId()).ifPresent((row) -> {
                sePayTransactions
                        .ensureLinkedAccount(
                                row.getBankCode(),
                                row.getAccountNumber(),
                                row.getAccountName(),
                                "GV" + createdPayee.instructorId())
                        .ifPresent((linked) -> {
                            row.setSepayAccountId(linked.id());
                            instructorBanks.save(row);
                            payment.setPayeeBank(row.getBankCode());
                            payment.setPayeeAccountNumber(row.getAccountNumber());
                            payment.setPayeeAccountName(row.getAccountName());
                            payments.save(payment);
                        });
            });
        }
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
            matchFromSePay(order, payment);
        }
        return toDto(order, payment);
    }

    @Transactional(readOnly = true)
    public List<PurchaseHistoryDTO> history(String authorization) {
        user account = userServices.requireAccount(authorization);
        return orders.findTop100ByUser_IdAndStatusOrderByIdDesc(account.getId(), "PAID").stream()
                .map(this::toHistoryDto)
                .toList();
    }

    @Transactional
    public CheckoutDTO latest(String authorization) {
        user account = requirePayer(authorization);
        List<ShopOrder> recent = orders.findTop20ByUser_IdOrderByIdDesc(account.getId());
        if (recent.isEmpty()) {
            throw new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng");
        }
        ShopOrder order = recent.get(0);
        Payment payment = payments.findFirstByOrderIdOrderByIdDesc(order.getId())
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy thanh toán"));
        if ("PENDING".equalsIgnoreCase(order.getStatus())
                && "BANK_TRANSFER".equalsIgnoreCase(payment.getProvider())) {
            matchFromSePay(order, payment);
        }
        return toDto(order, payment);
    }

    @Transactional
    public CheckoutDTO confirm(String authorization, String orderCode) {
        user account = requirePayer(authorization);
        ShopOrder order = requireOrder(account, orderCode);
        Payment payment = payments.findFirstByOrderIdOrderByIdDesc(order.getId())
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy thanh toán"));
        if ("BANK_TRANSFER".equalsIgnoreCase(payment.getProvider())) {
            matchFromSePay(order, payment);
            return toDto(order, payment);
        }
        settlePaid(order, payment, payment.getProviderTxnId());
        return toDto(order, payment);
    }

    @Transactional
    public boolean handleSePayIpn(String authorization, String rawBody) {
        if (!sePayAuthorized(authorization)) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "IPN SePay không hợp lệ");
        }
        if (rawBody == null || rawBody.isBlank()) {
            return true;
        }
        tools.jackson.databind.JsonNode body;
        try {
            body = new tools.jackson.databind.ObjectMapper().readTree(rawBody);
        } catch (RuntimeException exception) {
            return true;
        }
        String type = textNode(body, "notification_type");
        if ("ORDER_PAID".equalsIgnoreCase(type) || "TRANSACTION_CAPTURED".equalsIgnoreCase(type)) {
            tools.jackson.databind.JsonNode orderNode = body.path("order");
            String invoice = firstNonBlank(
                    textNode(orderNode, "order_invoice_number"),
                    textNode(orderNode, "order_id"));
            if (invoice.isBlank()) {
                return true;
            }
            Optional<ShopOrder> found = orders.findByOrderCode(invoice.trim());
            if (found.isEmpty()) {
                return true;
            }
            ShopOrder order = found.get();
            Payment payment = payments.findFirstByOrderIdOrderByIdDesc(order.getId()).orElse(null);
            if (payment == null) {
                return true;
            }
            String txn = firstNonBlank(
                    textNode(body.path("transaction"), "transaction_id"),
                    textNode(orderNode, "id"),
                    invoice);
            settlePaid(order, payment, "SEPAY-" + txn);
            return true;
        }
        return handleSePayPayload(toWebhookPayload(body));
    }

    @Transactional
    public boolean handleSePayWebhook(String authorization, SePayWebhookPayload payload) {
        if (!sePayAuthorized(authorization)) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Webhook SePay không hợp lệ");
        }
        return handleSePayPayload(payload);
    }

    private boolean handleSePayPayload(SePayWebhookPayload payload) {
        if (payload == null) {
            return true;
        }
        if (isFailedStatus(payload.getStatus())) {
            return true;
        }
        if (payload.getTransferType() != null && !payload.getTransferType().isBlank()
                && !"in".equalsIgnoreCase(payload.getTransferType().trim())
                && !"payment".equalsIgnoreCase(payload.getTransferType().trim())) {
            return true;
        }
        String rawId = firstNonBlank(payload.getTransactionId(), payload.getId());
        String txnId = rawId.isBlank() ? "" : "SEPAY-" + rawId;
        if (!txnId.isBlank() && payments.existsByProviderTxnId(txnId)) {
            return true;
        }
        Optional<ShopOrder> found = resolveSePayOrder(payload);
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
        if (paid.compareTo(BigDecimal.ZERO) > 0
                && paid.setScale(0, RoundingMode.DOWN).compareTo(due.setScale(0, RoundingMode.DOWN)) < 0) {
            return true;
        }
        settlePaid(order, payment, txnId.isBlank() ? payment.getProviderTxnId() : txnId);
        return true;
    }

    private void matchFromSePay(ShopOrder order, Payment payment) {
        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
            return;
        }
        Optional<String> captured = sePayGateway.findCaptured(order.getOrderCode(), order.getTotalAmount());
        if (captured.isPresent()) {
            settlePaid(order, payment, captured.get());
            return;
        }
        Optional<SePayTransactionClient.Hit> hit = sePayTransactions.findPaid(
                order.getOrderCode(),
                order.getTotalAmount(),
                payment.getPayeeAccountNumber());
        if (hit.isEmpty()) {
            hit = sePayTransactions.findPaid(order.getOrderCode(), order.getTotalAmount());
        }
        hit.ifPresent((row) -> settlePaid(order, payment, row.txnId()));
    }

    private CheckoutDTO latestOwnedCheckout(user account, Long courseId) {
        for (ShopOrder order : orders.findTop20ByUser_IdOrderByIdDesc(account.getId())) {
            boolean hasCourse = orderItems.findByOrderIdWithCourse(order.getId()).stream()
                    .anyMatch((item) -> item.getCourse() != null && courseId.equals(item.getCourse().getId()));
            if (!hasCourse) {
                continue;
            }
            Payment payment = payments.findFirstByOrderIdOrderByIdDesc(order.getId()).orElse(null);
            if (payment == null) {
                continue;
            }
            if ("PAID".equalsIgnoreCase(order.getStatus())
                    || "PENDING".equalsIgnoreCase(order.getStatus())) {
                if ("PENDING".equalsIgnoreCase(order.getStatus())
                        && "BANK_TRANSFER".equalsIgnoreCase(payment.getProvider())) {
                    matchFromSePay(order, payment);
                }
                return toDto(order, payment);
            }
        }
        return null;
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
        String title = "Thanh toán thành công";
        String body = "Đơn " + order.getOrderCode()
                + " đã được thanh toán. Khóa học đã mở trong mục Học tập.";
        Long userId = account.getId();
        Long orderId = order.getId();
        afterCommit(() -> notificationQueue.enqueue(new NotificationJob(
                userId,
                title,
                body,
                "PAYMENT",
                "ORDER",
                orderId)));
    }

    private void afterCommit(Runnable action) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            action.run();
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                action.run();
            }
        });
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

    private String nextOrderCode(Long instructorId) {
        String prefix = instructorId == null ? "LH" : "GV" + instructorId;
        for (int attempt = 0; attempt < 8; attempt += 1) {
            String code = prefix + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase(Locale.ROOT);
            if (!orders.existsByOrderCode(code)) {
                return code;
            }
        }
        return prefix + Long.toString(Math.abs(System.nanoTime()), 36).toUpperCase(Locale.ROOT);
    }

    private boolean sePayAuthorized(String authorization) {
        String provided = extractSePayKey(authorization);
        if (provided.isEmpty()) {
            return false;
        }
        return secretEquals(provided, sePayProperties.getIpnSecret())
                || secretEquals(provided, sePayProperties.getWebhookApiKey())
                || secretEquals(provided, sePayProperties.getApiToken());
    }

    private boolean secretEquals(String provided, String expected) {
        if (expected == null || expected.isBlank()) {
            return false;
        }
        byte[] left = expected.trim().getBytes(StandardCharsets.UTF_8);
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

    private boolean isFailedStatus(String status) {
        if (status == null || status.isBlank()) {
            return false;
        }
        String value = status.trim().toUpperCase(Locale.ROOT);
        return value.contains("FAIL") || value.contains("CANCEL") || value.contains("ERROR")
                || "0".equals(value) || "FALSE".equals(value);
    }

    private Optional<ShopOrder> resolveSePayOrder(SePayWebhookPayload payload) {
        if (payload.getOrderId() != null && !payload.getOrderId().isBlank()) {
            Optional<ShopOrder> byOrder = orders.findByOrderCode(payload.getOrderId().trim());
            if (byOrder.isPresent()) {
                return byOrder;
            }
        }
        String blob = sePayBlob(payload);
        Matcher matcher = ORDER_CODE.matcher(blob);
        while (matcher.find()) {
            String token = matcher.group().toUpperCase(Locale.ROOT);
            Optional<ShopOrder> exact = orders.findByOrderCode(token);
            if (exact.isPresent()) {
                return exact;
            }
        }
        BigDecimal paid = payload.getTransferAmount() == null ? BigDecimal.ZERO : payload.getTransferAmount();
        for (ShopOrder order : orders.findTop40ByStatusOrderByIdDesc("PENDING")) {
            if (!SePayTransactionClient.matchesOrder(blob, order.getOrderCode())) {
                continue;
            }
            BigDecimal due = order.getTotalAmount() == null ? BigDecimal.ZERO : order.getTotalAmount();
            if (paid.compareTo(BigDecimal.ZERO) > 0
                    && paid.setScale(0, RoundingMode.DOWN).compareTo(due.setScale(0, RoundingMode.DOWN)) < 0) {
                continue;
            }
            return Optional.of(order);
        }
        return Optional.empty();
    }

    private String sePayBlob(SePayWebhookPayload payload) {
        return ((payload.getOrderId() == null ? "" : payload.getOrderId()) + " "
                + (payload.getCode() == null ? "" : payload.getCode()) + " "
                + (payload.getContent() == null ? "" : payload.getContent()) + " "
                + (payload.getDescription() == null ? "" : payload.getDescription()) + " "
                + (payload.getReferenceCode() == null ? "" : payload.getReferenceCode())
                + " " + (payload.getTransactionId() == null ? "" : payload.getTransactionId()));
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

    private String qrUrl(ShopOrder order, String bank, String acc) {
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

    private void applyPayee(Payment payment, List<Course> courses) {
        Payee payee = resolvePayee(courses);
        payment.setPayeeBank(payee.bank());
        payment.setPayeeAccountNumber(payee.accountNumber());
        payment.setPayeeAccountName(payee.accountName());
    }

    private Payee resolvePayee(List<Course> courses) {
        Long instructorId = singleInstructorId(courses);
        if (instructorId != null) {
            Optional<InstructorBankAccount> saved = instructorBanks.findByUser_Id(instructorId);
            if (saved.isPresent()) {
                InstructorBankAccount row = saved.get();
                if (filled(row.getBankCode()) && filled(row.getAccountNumber()) && filled(row.getAccountName())) {
                    String sepayId = trimToEmpty(row.getSepayAccountId());
                    if (sepayId.isBlank()) {
                        sePayTransactions.invalidateBankCache();
                        Optional<SePayTransactionClient.LinkedAccount> linked =
                                sePayTransactions.findLinkedAccount(row.getAccountNumber());
                        if (linked.isPresent()) {
                            sepayId = linked.get().id();
                            row.setSepayAccountId(sepayId);
                            instructorBanks.save(row);
                        }
                    }
                    return new Payee(
                            row.getBankCode(),
                            row.getAccountNumber(),
                            row.getAccountName(),
                            instructorId,
                            sepayId);
                }
            }
            return platformPayee(instructorId);
        }
        return platformPayee(null);
    }

    private Long singleInstructorId(List<Course> courses) {
        Long instructorId = null;
        if (courses == null) {
            return null;
        }
        for (Course course : courses) {
            if (course == null || course.getInstructor() == null || course.getInstructor().getId() == null) {
                continue;
            }
            Long id = course.getInstructor().getId();
            if (instructorId == null) {
                instructorId = id;
            } else if (!instructorId.equals(id)) {
                return null;
            }
        }
        return instructorId;
    }

    private Payee payeeOf(Payment payment, List<OrderItem> items) {
        Payee latest = resolvePayee(items.stream().map(OrderItem::getCourse).toList());
        if (payment != null
                && ("PENDING".equalsIgnoreCase(payment.getStatus()) || !filled(payment.getPayeeAccountNumber()))) {
            return latest;
        }
        if (payment != null && filled(payment.getPayeeAccountNumber()) && filled(payment.getPayeeBank())) {
            return new Payee(
                    payment.getPayeeBank(),
                    payment.getPayeeAccountNumber(),
                    firstNonBlank(payment.getPayeeAccountName(), sePayProperties.getAccountName()),
                    latest.instructorId(),
                    latest.sepayAccountId());
        }
        return latest;
    }

    private boolean sameAccount(String left, String right) {
        return digitsOf(left).equals(digitsOf(right)) && !digitsOf(left).isEmpty();
    }

    private String digitsOf(String value) {
        if (value == null) {
            return "";
        }
        return value.replaceAll("\\D+", "");
    }

    private Payee platformPayee(Long instructorId) {
        return new Payee(
                firstNonBlank(sePayProperties.getBank(), "MBBank"),
                firstNonBlank(sePayProperties.getAccountNumber(), ""),
                firstNonBlank(sePayProperties.getAccountName(), "LE VAN HAU"),
                instructorId,
                "");
    }

    private boolean filled(String value) {
        return value != null && !value.isBlank();
    }

    private String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private record Payee(
            String bank,
            String accountNumber,
            String accountName,
            Long instructorId,
            String sepayAccountId) {
    }

    private String encode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }

    private CheckoutDTO toDto(ShopOrder order, Payment payment) {
        List<OrderItem> rows = orderItems.findByOrderIdWithCourse(order.getId());
        List<CheckoutItemDTO> items = rows.stream().map(this::toItemDto).toList();
        Payee payee = payeeOf(payment, rows);
        if ("BANK_TRANSFER".equalsIgnoreCase(payment.getProvider())
                && "PENDING".equalsIgnoreCase(order.getStatus())) {
            applyPayee(payment, rows.stream().map(OrderItem::getCourse).toList());
            payments.save(payment);
            payee = payeeOf(payment, rows);
        }
        BankTransferDTO bank = null;
        if ("BANK_TRANSFER".equalsIgnoreCase(payment.getProvider())) {
            String sync = firstNonBlank(sePayGateway.lastMessage(), sePayTransactions.lastMessage());
            String code = firstNonBlank(payee.bank(), sePayProperties.getBank(), "MBBank");
            bank = new BankTransferDTO(
                    code,
                    firstNonBlank(VnBanks.nameOf(code), code),
                    payee.accountName(),
                    payee.accountNumber(),
                    order.getOrderCode(),
                    qrUrl(order, code, payee.accountNumber()),
                    sync);
        }
        SePayGatewayDTO gateway = null;
        if ("PENDING".equalsIgnoreCase(order.getStatus())) {
            Long instructorId = payee.instructorId();
            String accountNumber = payee.accountNumber();
            if (filled(accountNumber) && !filled(payee.sepayAccountId())) {
                sePayTransactions.invalidateBankCache();
                sePayTransactions.findLinkedAccount(accountNumber).ifPresent((linked) -> {
                    if (instructorId != null) {
                        instructorBanks.findByUser_Id(instructorId).ifPresent((row) -> {
                            row.setSepayAccountId(linked.id());
                            instructorBanks.save(row);
                        });
                    }
                });
                payee = payeeOf(payment, rows);
            }
            String custom = filled(payee.accountNumber())
                    ? firstNonBlank(payee.bank(), "") + "|" + payee.accountNumber()
                    : "";
            String customerId = payee.instructorId() != null
                    ? "GV" + payee.instructorId()
                    : "U" + order.getUser().getId();
            gateway = sePayGateway.checkoutForm(
                    order,
                    new SePayGatewayClient.CheckoutExtras(
                            custom,
                            customerId,
                            payee.accountNumber(),
                            payee.bank(),
                            trimToEmpty(payee.sepayAccountId())));
        }
        return new CheckoutDTO(
                order.getId(),
                order.getOrderCode(),
                order.getStatus(),
                payment.getProvider(),
                payment.getStatus(),
                order.getSubtotal(),
                order.getDiscountAmount(),
                order.getTotalAmount(),
                order.getCoupon() == null ? null : order.getCoupon().getCode(),
                order.getCurrency(),
                payment.getCheckoutUrl(),
                bank,
                gateway,
                items);
    }

    private SePayWebhookPayload toWebhookPayload(tools.jackson.databind.JsonNode body) {
        SePayWebhookPayload payload = new SePayWebhookPayload();
        payload.setId(textNode(body, "id"));
        payload.setOrderId(firstNonBlank(textNode(body, "order_id"), textNode(body, "orderId")));
        payload.setTransactionId(firstNonBlank(textNode(body, "transaction_id"), textNode(body, "transactionId")));
        payload.setStatus(textNode(body, "status"));
        payload.setGateway(textNode(body, "gateway"));
        payload.setTransactionDate(textNode(body, "transaction_date"));
        payload.setAccountNumber(textNode(body, "account_number"));
        payload.setCode(textNode(body, "code"));
        payload.setContent(firstNonBlank(textNode(body, "content"), textNode(body, "transaction_content")));
        payload.setTransferType(textNode(body, "transfer_type"));
        payload.setReferenceCode(textNode(body, "reference_code"));
        payload.setDescription(textNode(body, "description"));
        String amount = firstNonBlank(textNode(body, "transfer_amount"), textNode(body, "amount"));
        if (!amount.isBlank()) {
            try {
                payload.setTransferAmount(new BigDecimal(amount.replace(",", "")));
            } catch (NumberFormatException ignored) {
            }
        }
        return payload;
    }

    private String textNode(tools.jackson.databind.JsonNode node, String field) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return "";
        }
        tools.jackson.databind.JsonNode value = node.get(field);
        if (value == null || value.isNull() || value.isMissingNode()) {
            return "";
        }
        String text = value.asString("");
        return text == null ? "" : text.trim();
    }

    private PurchaseHistoryDTO toHistoryDto(ShopOrder order) {
        Payment payment = payments.findFirstByOrderIdOrderByIdDesc(order.getId()).orElse(null);
        List<CheckoutItemDTO> items = orderItems.findByOrderIdWithCourse(order.getId()).stream()
                .map(this::toItemDto)
                .toList();
        return new PurchaseHistoryDTO(
                order.getId(),
                order.getOrderCode(),
                order.getStatus(),
                payment == null ? "" : payment.getProvider(),
                payment == null ? "" : payment.getStatus(),
                order.getTotalAmount(),
                order.getCurrency(),
                order.getPaidAt(),
                order.getCreatedAt(),
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
