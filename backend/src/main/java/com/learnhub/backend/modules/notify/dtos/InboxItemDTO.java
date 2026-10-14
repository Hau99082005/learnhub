package com.learnhub.backend.modules.notify.dtos;

import java.time.LocalDateTime;

public class InboxItemDTO {
    private final Long id;
    private final String title;
    private final String body;
    private final String type;
    private final String referenceType;
    private final Long referenceId;
    private final Boolean isRead;
    private final LocalDateTime createdAt;
    private final String href;
    private final String couponCode;

    public InboxItemDTO(
            Long id,
            String title,
            String body,
            String type,
            String referenceType,
            Long referenceId,
            Boolean isRead,
            LocalDateTime createdAt,
            String href,
            String couponCode) {
        this.id = id;
        this.title = title;
        this.body = body;
        this.type = type;
        this.referenceType = referenceType;
        this.referenceId = referenceId;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.href = href;
        this.couponCode = couponCode;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getBody() {
        return body;
    }

    public String getType() {
        return type;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getHref() {
        return href;
    }

    public String getCouponCode() {
        return couponCode;
    }
}
