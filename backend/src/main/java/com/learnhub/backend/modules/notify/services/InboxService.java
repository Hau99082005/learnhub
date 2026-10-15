package com.learnhub.backend.modules.notify.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.learnhub.backend.modules.cart.repositories.CertificateRepository;
import com.learnhub.backend.modules.coupon.models.Coupon;
import com.learnhub.backend.modules.coupon.repositories.CouponRepository;
import com.learnhub.backend.modules.notify.dtos.InboxCountDTO;
import com.learnhub.backend.modules.notify.dtos.InboxItemDTO;
import com.learnhub.backend.modules.notify.models.AppNotification;
import com.learnhub.backend.modules.notify.models.NotificationJob;
import com.learnhub.backend.modules.notify.repositories.AppNotificationRepository;
import com.learnhub.backend.modules.user.exceptions.AuthException;
import com.learnhub.backend.modules.user.models.user;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;

@Service
public class InboxService {
    private final AppNotificationRepository notifications;
    private final CouponRepository coupons;
    private final CertificateRepository certificates;
    private final UserServicesInterfaces userServices;

    public InboxService(
            AppNotificationRepository notifications,
            CouponRepository coupons,
            CertificateRepository certificates,
            UserServicesInterfaces userServices) {
        this.notifications = notifications;
        this.coupons = coupons;
        this.certificates = certificates;
        this.userServices = userServices;
    }

    @Transactional
    public void deliver(NotificationJob job) {
        if (job == null || job.userId() == null) {
            return;
        }
        if (job.referenceId() != null
                && notifications.existsByUserIdAndTypeAndReferenceId(job.userId(), job.type(), job.referenceId())) {
            return;
        }
        AppNotification row = new AppNotification();
        row.setUserId(job.userId());
        row.setTitle(job.title() == null || job.title().isBlank() ? "Thông báo LearnHub" : job.title().trim());
        row.setBody(job.body() == null ? "" : job.body().trim());
        row.setType(job.type() == null ? "SYSTEM" : job.type().trim().toUpperCase(Locale.ROOT));
        row.setReferenceType(job.referenceType());
        row.setReferenceId(job.referenceId());
        row.setIsRead(false);
        notifications.save(row);
    }

    @Transactional(readOnly = true)
    public List<InboxItemDTO> list(String authorization) {
        user account = userServices.requireAccount(authorization);
        return notifications.findByUserIdOrderByCreatedAtDesc(account.getId()).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public InboxCountDTO unread(String authorization) {
        user account = userServices.requireAccount(authorization);
        return new InboxCountDTO(notifications.countByUserIdAndIsReadFalse(account.getId()));
    }

    @Transactional
    public InboxItemDTO markRead(String authorization, Long id) {
        user account = userServices.requireAccount(authorization);
        AppNotification row = notifications.findById(id)
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo"));
        if (!row.getUserId().equals(account.getId())) {
            throw new AuthException(HttpStatus.FORBIDDEN, "Bạn không thể xem thông báo này");
        }
        if (!Boolean.TRUE.equals(row.getIsRead())) {
            row.setIsRead(true);
            row.setReadAt(LocalDateTime.now());
            notifications.save(row);
        }
        return toDto(row);
    }

    @Transactional
    public InboxCountDTO markAllRead(String authorization) {
        user account = userServices.requireAccount(authorization);
        notifications.markAllRead(account.getId(), LocalDateTime.now());
        return new InboxCountDTO(0);
    }

    private InboxItemDTO toDto(AppNotification row) {
        String couponCode = null;
        String href = "/thong-bao";
        if ("PAYMENT".equalsIgnoreCase(row.getType())) {
            href = "/hoc-tap";
        } else if (("CERTIFICATE".equalsIgnoreCase(row.getType())
                || "CERTIFICATE_GRADE".equalsIgnoreCase(row.getType()))
                && row.getReferenceId() != null) {
            href = certificates.findByEnrollmentId(row.getReferenceId())
                    .map((cert) -> "/chung-chi/" + cert.getCertificateCode())
                    .orElse("/hoc-tap?tab=certs");
        } else if ("COUPON".equalsIgnoreCase(row.getType()) && row.getReferenceId() != null) {
            couponCode = coupons.findById(row.getReferenceId()).map(Coupon::getCode).orElse(null);
            href = couponCode == null ? "/thanh-toan" : "/thanh-toan?coupon=" + couponCode;
        }
        return new InboxItemDTO(
                row.getId(),
                row.getTitle(),
                row.getBody(),
                row.getType(),
                row.getReferenceType(),
                row.getReferenceId(),
                Boolean.TRUE.equals(row.getIsRead()),
                row.getCreatedAt(),
                href,
                couponCode);
    }
}
