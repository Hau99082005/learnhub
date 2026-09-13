package com.learnhub.backend.modules.user.dtos;

public class GoogleAuthRequest {
    private String idToken;
    private String role;

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
