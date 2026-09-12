package com.learnhub.backend.modules.user.dtos;

public class userDTO {
    private final Long id;
    private final String email;
    private final String fullName;
    private final String role;

    public userDTO(Long id, String email, String fullName, String role) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public String getRole() {
        return role;
    }
}
