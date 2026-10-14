package com.learnhub.backend.modules.notify.services;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;

import org.springframework.stereotype.Service;

import com.learnhub.backend.modules.notify.models.NotificationJob;

@Service
public class NotificationQueue {
    private final ConcurrentLinkedQueue<NotificationJob> jobs = new ConcurrentLinkedQueue<>();

    public void enqueue(NotificationJob job) {
        if (job == null || job.userId() == null) {
            return;
        }
        jobs.offer(job);
    }

    public List<NotificationJob> drain(int limit) {
        int cap = Math.max(1, limit);
        List<NotificationJob> batch = new ArrayList<>(Math.min(cap, 32));
        NotificationJob next;
        while (batch.size() < cap && (next = jobs.poll()) != null) {
            batch.add(next);
        }
        return batch;
    }

    public int size() {
        return jobs.size();
    }
}
