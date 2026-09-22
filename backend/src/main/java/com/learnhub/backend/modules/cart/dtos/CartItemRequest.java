package com.learnhub.backend.modules.cart.dtos;

public class CartItemRequest {
    private Long courseId;

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }
}
