package com.learnhub.backend.modules.instructor.dtos;

import java.util.List;

public class ResourceCourseDTO {
    private final Long id;
    private final String title;
    private final String images;
    private final String status;
    private final int score;
    private final List<String> gaps;

    public ResourceCourseDTO(
            Long id,
            String title,
            String images,
            String status,
            int score,
            List<String> gaps) {
        this.id = id;
        this.title = title;
        this.images = images;
        this.status = status;
        this.score = score;
        this.gaps = gaps;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getImages() {
        return images;
    }

    public String getStatus() {
        return status;
    }

    public int getScore() {
        return score;
    }

    public List<String> getGaps() {
        return gaps;
    }
}
