package com.learnhub.backend.modules.cart.dtos;

public class AdminOrderStatusCountDTO {
    private final String key;
    private final String label;
    private final long total;
    private final long paid;
    private final long pending;
    private final long cancelled;
    private final long failed;
    private final long refunded;
    private final long buyers;

    public AdminOrderStatusCountDTO(
            String key,
            String label,
            long total,
            long paid,
            long pending,
            long cancelled,
            long failed,
            long refunded,
            long buyers) {
        this.key = key;
        this.label = label;
        this.total = total;
        this.paid = paid;
        this.pending = pending;
        this.cancelled = cancelled;
        this.failed = failed;
        this.refunded = refunded;
        this.buyers = buyers;
    }

    public String getKey() {
        return key;
    }

    public String getLabel() {
        return label;
    }

    public long getTotal() {
        return total;
    }

    public long getPaid() {
        return paid;
    }

    public long getPending() {
        return pending;
    }

    public long getCancelled() {
        return cancelled;
    }

    public long getFailed() {
        return failed;
    }

    public long getRefunded() {
        return refunded;
    }

    public long getBuyers() {
        return buyers;
    }
}
