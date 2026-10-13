package com.learnhub.backend.modules.user.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.function.BiFunction;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.learnhub.backend.modules.cart.repositories.PaymentRepository;
import com.learnhub.backend.modules.cart.repositories.ShopOrderRepository;
import com.learnhub.backend.modules.instructor.repositories.CourseRepository;
import com.learnhub.backend.modules.user.dtos.DashboardCardDTO;
import com.learnhub.backend.modules.user.dtos.DashboardStatsDTO;
import com.learnhub.backend.modules.user.repositories.userRepository;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;

@Service
public class AdminDashboardService {
    private final UserServicesInterfaces userServices;
    private final userRepository users;
    private final ShopOrderRepository orders;
    private final CourseRepository courses;
    private final PaymentRepository payments;

    public AdminDashboardService(
            UserServicesInterfaces userServices,
            userRepository users,
            ShopOrderRepository orders,
            CourseRepository courses,
            PaymentRepository payments) {
        this.userServices = userServices;
        this.users = users;
        this.orders = orders;
        this.courses = courses;
        this.payments = payments;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDTO stats(String authorization) {
        userServices.requireAdmin(authorization);
        LocalDate thisMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate lastMonth = thisMonth.minusMonths(1);
        LocalDate nextMonth = thisMonth.plusMonths(1);
        List<DashboardCardDTO> cards = new ArrayList<>();
        cards.add(card(
                "users",
                "Users",
                users.countByDeletedAtIsNull(),
                users.countByDeletedAtIsNullAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                        lastMonth.atStartOfDay(),
                        thisMonth.atStartOfDay()),
                users.countByDeletedAtIsNullAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                        thisMonth.atStartOfDay(),
                        nextMonth.atStartOfDay()),
                this::countUsers));
        cards.add(card(
                "orders",
                "Orders",
                orders.count(),
                orders.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                        lastMonth.atStartOfDay(),
                        thisMonth.atStartOfDay()),
                orders.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                        thisMonth.atStartOfDay(),
                        nextMonth.atStartOfDay()),
                this::countOrders));
        cards.add(card(
                "courses",
                "Courses",
                courses.countByDeletedAtIsNull(),
                courses.countByDeletedAtIsNullAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                        lastMonth.atStartOfDay(),
                        thisMonth.atStartOfDay()),
                courses.countByDeletedAtIsNullAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                        thisMonth.atStartOfDay(),
                        nextMonth.atStartOfDay()),
                this::countCourses));
        cards.add(card(
                "payments",
                "Payments",
                payments.count(),
                payments.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                        lastMonth.atStartOfDay(),
                        thisMonth.atStartOfDay()),
                payments.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                        thisMonth.atStartOfDay(),
                        nextMonth.atStartOfDay()),
                this::countPayments));
        return new DashboardStatsDTO(List.copyOf(cards));
    }

    private DashboardCardDTO card(
            String key,
            String label,
            long total,
            long previous,
            long current,
            BiFunction<LocalDateTime, LocalDateTime, Long> monthly) {
        double delta = previous == 0
                ? (current > 0 ? 100d : 0d)
                : ((current - previous) * 100d / previous);
        return new DashboardCardDTO(
                key,
                label,
                total,
                String.format(Locale.US, "%.1f%%", Math.abs(delta)),
                delta >= 0,
                series(monthly));
    }

    private List<Long> series(BiFunction<LocalDateTime, LocalDateTime, Long> monthly) {
        LocalDate cursor = LocalDate.now().withDayOfMonth(1).minusMonths(5);
        List<Long> points = new ArrayList<>();
        for (int index = 0; index < 6; index++) {
            LocalDate next = cursor.plusMonths(1);
            points.add(monthly.apply(cursor.atStartOfDay(), next.atStartOfDay()));
            cursor = next;
        }
        return List.copyOf(points);
    }

    private long countUsers(LocalDateTime start, LocalDateTime end) {
        return users.countByDeletedAtIsNullAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(start, end);
    }

    private long countOrders(LocalDateTime start, LocalDateTime end) {
        return orders.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(start, end);
    }

    private long countCourses(LocalDateTime start, LocalDateTime end) {
        return courses.countByDeletedAtIsNullAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(start, end);
    }

    private long countPayments(LocalDateTime start, LocalDateTime end) {
        return payments.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(start, end);
    }
}
