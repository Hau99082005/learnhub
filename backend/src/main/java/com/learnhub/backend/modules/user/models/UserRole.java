package com.learnhub.backend.modules.user.models;

public enum UserRole {
    ADMIN("admin", "Quản trị"),
    INSTRUCTOR("instructor", "Giảng viên"),
    USER("user", "Học viên");

    private final String canonical;
    private final String label;

    UserRole(String canonical, String label) {
        this.canonical = canonical;
        this.label = label;
    }

    public String getCanonical() {
        return canonical;
    }

    public String getLabel() {
        return label;
    }

    public static UserRole from(String value) {
        if (value == null || value.isBlank()) {
            return USER;
        }
        String normalized = value.trim().toLowerCase();
        for (UserRole role : values()) {
            if (role.name().equalsIgnoreCase(normalized) || role.canonical.equals(normalized)) {
                return role;
            }
        }
        return USER;
    }

    public static UserRole fromPublic(String value) {
        UserRole role = from(value);
        if (role == ADMIN) {
            return USER;
        }
        return role;
    }
}
