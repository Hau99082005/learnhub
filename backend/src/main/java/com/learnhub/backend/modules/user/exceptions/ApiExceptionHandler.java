package com.learnhub.backend.modules.user.exceptions;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<Map<String, String>> handleAuth(AuthException exception) {
        Map<String, String> body = new LinkedHashMap<>();
        body.put("message", exception.getMessage());
        String errorField = exception.getErrorField();
        if (errorField != null && !errorField.isBlank()) {
            body.put("field", errorField);
        }
        return ResponseEntity.status(exception.getStatus()).body(body);
    }
}
