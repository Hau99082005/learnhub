package com.learnhub.backend.modules.user.dtos;

import java.time.LocalDateTime;

public class ProfileDTO {
    private final Long id;
    private final String email;
    private final String username;
    private final String fullName;
    private final String phone;
    private final String address;
    private final String bio;
    private final String role;
    private final boolean emailVerified;
    private final LocalDateTime createdAt;

    public ProfileDTO(
            Long id,
            String email,
            String username,
            String fullName,
            String phone,
            String address,
            String bio,
            String role,
            boolean emailVerified,
            LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.fullName = fullName;
        this.phone = phone;
        this.address = address;
        this.bio = bio;
        this.role = role;
        this.emailVerified = emailVerified;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getUsername() {
        return username;
    }

    public String getFullName() {
        return fullName;
    }

    public String getPhone() {
        return phone;
    }

    public String getAddress() {
        return address;
    }

    public String getBio() {
        return bio;
    }

    public String getRole() {
        return role;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
