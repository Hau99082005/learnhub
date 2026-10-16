package com.learnhub.backend.modules.cart.services;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.learnhub.backend.modules.cart.dtos.AdminOrderRowDTO;
import com.learnhub.backend.modules.cart.dtos.AdminOrderStatusCountDTO;
import com.learnhub.backend.modules.cart.dtos.AdminOrdersPageDTO;
import com.learnhub.backend.modules.cart.models.OrderItem;
import com.learnhub.backend.modules.cart.models.Payment;
import com.learnhub.backend.modules.cart.models.ShopOrder;
import com.learnhub.backend.modules.cart.repositories.OrderItemRepository;
import com.learnhub.backend.modules.cart.repositories.PaymentRepository;
import com.learnhub.backend.modules.cart.repositories.ShopOrderRepository;
import com.learnhub.backend.modules.user.models.user;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;

@Service
public class AdminOrderService {
    private final UserServicesInterfaces userServices;
    private final ShopOrderRepository orders;
    private final OrderItemRepository orderItems;
    private final PaymentRepository payments;

    public AdminOrderService(
            UserServicesInterfaces userServices,
            ShopOrderRepository orders,
            OrderItemRepository orderItems,
            PaymentRepository payments) {
        this.userServices = userServices;
        this.orders = orders;
        this.orderItems = orderItems;
        this.payments = payments;
    }

    @Transactional(readOnly = true)
    public AdminOrdersPageDTO list(String authorization) {
        userServices.requireAdmin(authorization);
        Map<String, Long> allStatus = toStatusMap(orders.countGroupedByStatus());
        Map<String, Map<String, Long>> byRole = new LinkedHashMap<>();
        for (Object[] row : orders.countGroupedByRoleAndStatus()) {
            String role = text(row.length > 0 ? row[0] : null);
            String status = text(row.length > 1 ? row[1] : null);
            if (role.isBlank()) {
                role = "USER";
            }
            byRole.computeIfAbsent(role, (key) -> new HashMap<>())
                    .merge(status, num(row.length > 2 ? row[2] : null), Long::sum);
        }
        List<AdminOrderStatusCountDTO> groups = new ArrayList<>();
        groups.add(toGroup("ALL", "Tất cả người dùng", allStatus, orders.countDistinctBuyers()));
        groups.add(toGroup(
                "USER",
                "Học viên",
                byRole.getOrDefault("USER", Map.of()),
                orders.countDistinctBuyersByRole("USER")));
        groups.add(toGroup(
                "INSTRUCTOR",
                "Giảng viên",
                byRole.getOrDefault("INSTRUCTOR", Map.of()),
                orders.countDistinctBuyersByRole("INSTRUCTOR")));
        BigDecimal paidAmount = orders.sumPaidTotal();
        if (paidAmount == null) {
            paidAmount = BigDecimal.ZERO;
        }
        return new AdminOrdersPageDTO(List.copyOf(groups), paidAmount, listRows());
    }

    private List<AdminOrderRowDTO> listRows() {
        List<ShopOrder> rows = orders.findTop300ByOrderByIdDesc();
        if (rows.isEmpty()) {
            return List.of();
        }
        List<Long> ids = rows.stream().map(ShopOrder::getId).toList();
        Map<Long, List<String>> courses = new HashMap<>();
        for (OrderItem item : orderItems.findByOrder_IdInOrderByIdAsc(ids)) {
            if (item.getOrder() == null || item.getOrder().getId() == null) {
                continue;
            }
            String title = item.getCourseTitle();
            if (title == null || title.isBlank()) {
                title = "Khóa học";
            }
            courses.computeIfAbsent(item.getOrder().getId(), (key) -> new ArrayList<>()).add(title);
        }
        Map<Long, Payment> latestPay = new HashMap<>();
        for (Payment payment : payments.findByOrder_IdIn(ids)) {
            if (payment.getOrder() == null || payment.getOrder().getId() == null) {
                continue;
            }
            latestPay.merge(payment.getOrder().getId(), payment, (left, right) -> {
                Long leftId = left.getId() == null ? 0L : left.getId();
                Long rightId = right.getId() == null ? 0L : right.getId();
                return rightId >= leftId ? right : left;
            });
        }
        List<AdminOrderRowDTO> result = new ArrayList<>();
        for (ShopOrder order : rows) {
            user account = order.getUser();
            Payment payment = latestPay.get(order.getId());
            String provider = payment != null && filled(payment.getProvider())
                    ? payment.getProvider()
                    : (filled(order.getNotes()) ? order.getNotes() : "");
            result.add(new AdminOrderRowDTO(
                    order.getId(),
                    order.getOrderCode(),
                    order.getStatus(),
                    provider,
                    payment == null ? "" : payment.getStatus(),
                    order.getTotalAmount() == null ? BigDecimal.ZERO : order.getTotalAmount(),
                    order.getCurrency() == null ? "VND" : order.getCurrency(),
                    account == null ? null : account.getId(),
                    account == null ? "" : firstNonBlank(account.getFullName(), account.getUsername(), account.getEmail()),
                    account == null ? "" : (account.getEmail() == null ? "" : account.getEmail()),
                    account == null || account.getRole() == null ? "USER" : account.getRole().toUpperCase(Locale.ROOT),
                    List.copyOf(courses.getOrDefault(order.getId(), List.of())),
                    order.getPaidAt(),
                    order.getCreatedAt()));
        }
        return List.copyOf(result);
    }

    private AdminOrderStatusCountDTO toGroup(String key, String label, Map<String, Long> byStatus, long buyers) {
        long paid = byStatus.getOrDefault("PAID", 0L);
        long pending = byStatus.getOrDefault("PENDING", 0L);
        long cancelled = byStatus.getOrDefault("CANCELLED", 0L) + byStatus.getOrDefault("CANCELED", 0L);
        long failed = byStatus.getOrDefault("FAILED", 0L);
        long refunded = byStatus.getOrDefault("REFUNDED", 0L);
        long total = 0L;
        for (long value : byStatus.values()) {
            total += value;
        }
        return new AdminOrderStatusCountDTO(key, label, total, paid, pending, cancelled, failed, refunded, buyers);
    }

    private Map<String, Long> toStatusMap(List<Object[]> rows) {
        Map<String, Long> map = new HashMap<>();
        for (Object[] row : rows) {
            String status = text(row.length > 0 ? row[0] : null);
            if (status.isBlank()) {
                continue;
            }
            map.merge(status, num(row.length > 1 ? row[1] : null), Long::sum);
        }
        return map;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim().toUpperCase(Locale.ROOT);
    }

    private long num(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        return 0L;
    }

    private boolean filled(String value) {
        return value != null && !value.isBlank();
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return "";
    }
}
