package com.learnhub.backend.modules.coupon.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.learnhub.backend.modules.coupon.models.Coupon;
import com.learnhub.backend.modules.coupon.repositories.CouponRepository;
import com.learnhub.backend.modules.notify.models.NotificationJob;
import com.learnhub.backend.modules.notify.services.NotificationQueue;
import com.learnhub.backend.modules.user.models.user;
import com.learnhub.backend.modules.user.repositories.userRepository;

@Component
public class HolidayCouponScheduler {
    private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("d/M/yyyy");
    private static final Holiday[] HOLIDAYS = {
            new Holiday(1, 1, "Năm mới", 20),
            new Holiday(17, 2, "Tết Nguyên đán", 25),
            new Holiday(8, 3, "Quốc tế Phụ nữ", 15),
            new Holiday(30, 4, "Giải phóng miền Nam", 20),
            new Holiday(1, 5, "Quốc tế Lao động", 20),
            new Holiday(2, 9, "Quốc khánh", 25),
            new Holiday(20, 10, "Phụ nữ Việt Nam", 20),
            new Holiday(20, 11, "Nhà giáo Việt Nam", 20),
            new Holiday(24, 12, "Giáng sinh", 20),
            new Holiday(25, 12, "Giáng sinh", 20),
    };

    private final CouponRepository coupons;
    private final userRepository users;
    private final NotificationQueue queue;

    public HolidayCouponScheduler(
            CouponRepository coupons,
            userRepository users,
            NotificationQueue queue) {
        this.coupons = coupons;
        this.users = users;
        this.queue = queue;
    }

    @Scheduled(initialDelay = 8000, fixedDelay = 6 * 60 * 60 * 1000)
    @Transactional
    public void publishHolidayCoupons() {
        LocalDate today = LocalDate.now(ZONE);
        Holiday hit = nearest(today, 10);
        if (hit == null) {
            return;
        }
        LocalDate date = LocalDate.of(today.getYear(), hit.month(), hit.day());
        String code = "LE" + String.format(Locale.ROOT, "%02d%02d%d", hit.month(), hit.day(), date.getYear());
        Coupon coupon = coupons.findByCodeIgnoreCase(code).orElseGet(() -> {
            Coupon row = new Coupon();
            row.setCode(code);
            row.setDiscountType("PERCENT");
            row.setDiscountValue(BigDecimal.valueOf(hit.percent()));
            row.setMinOrderAmount(BigDecimal.ZERO);
            row.setMaxUses(0);
            row.setUsedCount(0);
            row.setStartsAt(today.atStartOfDay());
            row.setExpiresAt(date.plusDays(3).atTime(23, 59, 59));
            row.setStatus("ACTIVE");
            return coupons.saveAndFlush(row);
        });
        String title = "Mã giảm giá " + hit.name();
        LocalDate until = coupon.getExpiresAt() == null
                ? date.plusDays(3)
                : coupon.getExpiresAt().toLocalDate();
        String body = "Mã " + coupon.getCode() + " giảm " + hit.percent()
                + "% cho đơn hàng dịp " + hit.name()
                + ". Áp dụng đến " + DAY.format(until) + ".";
        List<user> accounts = users.findByDeletedAtIsNullAndStatus("ACTIVE");
        for (user account : accounts) {
            queue.enqueue(new NotificationJob(
                    account.getId(),
                    title,
                    body,
                    "COUPON",
                    "COUPON",
                    coupon.getId()));
        }
    }

    private Holiday nearest(LocalDate today, int windowDays) {
        Holiday best = null;
        long bestDelta = Long.MAX_VALUE;
        for (Holiday holiday : HOLIDAYS) {
            LocalDate date;
            try {
                date = LocalDate.of(today.getYear(), holiday.month(), holiday.day());
            } catch (RuntimeException ignored) {
                continue;
            }
            long delta = java.time.temporal.ChronoUnit.DAYS.between(today, date);
            if (delta < 0 || delta > windowDays) {
                continue;
            }
            if (delta < bestDelta) {
                best = holiday;
                bestDelta = delta;
            }
        }
        return best;
    }

    private record Holiday(int day, int month, String name, int percent) {
    }
}
