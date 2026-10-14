package com.learnhub.backend.modules.instructor.dtos;

import java.util.List;

public class PublishCourseDTO {
    private final Long id;
    private final String title;
    private final String slug;
    private final String images;
    private final String status;
    private final boolean ready;
    private final int done;
    private final int total;
    private final List<PublishItemDTO> items;

    public PublishCourseDTO(
            Long id,
            String title,
            String slug,
            String images,
            String status,
            boolean ready,
            int done,
            int total,
            List<PublishItemDTO> items) {
        this.id = id;
        this.title = title;
        this.slug = slug;
        this.images = images;
        this.status = status;
        this.ready = ready;
        this.done = done;
        this.total = total;
        this.items = items;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getSlug() {
        return slug;
    }

    public String getImages() {
        return images;
    }

    public String getStatus() {
        return status;
    }

    public boolean isReady() {
        return ready;
    }

    public int getDone() {
        return done;
    }

    public int getTotal() {
        return total;
    }

    public List<PublishItemDTO> getItems() {
        return items;
    }
}
