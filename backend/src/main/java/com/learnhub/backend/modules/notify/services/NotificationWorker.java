package com.learnhub.backend.modules.notify.services;

import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.learnhub.backend.modules.notify.models.NotificationJob;

@Component
public class NotificationWorker {
    private final NotificationQueue queue;
    private final InboxService inbox;

    public NotificationWorker(NotificationQueue queue, InboxService inbox) {
        this.queue = queue;
        this.inbox = inbox;
    }

    @Scheduled(fixedDelay = 400)
    public void process() {
        List<NotificationJob> batch = queue.drain(40);
        for (NotificationJob job : batch) {
            inbox.deliver(job);
        }
    }
}
