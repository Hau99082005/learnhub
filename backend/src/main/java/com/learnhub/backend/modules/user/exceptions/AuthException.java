package com.learnhub.backend.modules.user.exceptions;

import org.springframework.http.HttpStatus;

public class AuthException extends RuntimeException {
    private final HttpStatus status;
    private final String errorField;

    public AuthException(HttpStatus status, String message) {
        this(status, message, null);
    }

    public AuthException(HttpStatus status, String message, String errorField) {
        super(message);
        this.status = status;
        this.errorField = errorField;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getErrorField() {
        return errorField;
    }
}
