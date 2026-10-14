package com.learnhub.backend.modules.notify.dtos;

public class InboxCountDTO {
    private final long unread;

    public InboxCountDTO(long unread) {
        this.unread = unread;
    }

    public long getUnread() {
        return unread;
    }
}
