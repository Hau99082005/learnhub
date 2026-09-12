package com.learnhub.backend.modules.user.exceptions;

import org.springframework.http.HttpStatus;

public class AuthException extends RuntimeException {
    private final HttpStatus status;
    private final String field;

    public AuthException(HttpStatus status, String message) {
        this(status, message, null);
    }

    public AuthException(HttpStatus status, String message, String field) {
        super(message);
        this.status = status;
        this.field = field;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getField() {
        return field;
    }
}
