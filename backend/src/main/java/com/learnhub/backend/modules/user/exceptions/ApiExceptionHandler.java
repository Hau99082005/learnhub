package com.learnhub.backend.modules.user.exceptions;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

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

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<Map<String, String>> handleMissingPart(MissingServletRequestPartException exception) {
        Map<String, String> body = new LinkedHashMap<>();
        body.put("message", "Vui lòng chọn ảnh khóa học");
        body.put("field", "image");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, String>> handleType(MethodArgumentTypeMismatchException exception) {
        Map<String, String> body = new LinkedHashMap<>();
        body.put("message", "Dữ liệu không hợp lệ");
        if (exception.getName() != null) {
            body.put("field", exception.getName());
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> handleSize(MaxUploadSizeExceededException exception) {
        Map<String, String> body = new LinkedHashMap<>();
        body.put("message", "File vượt quá dung lượng cho phép");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleIntegrity(DataIntegrityViolationException exception) {
        Map<String, String> body = new LinkedHashMap<>();
        body.put("message", "Không thể lưu khóa học. Kiểm tra tên, slug hoặc ràng buộc dữ liệu");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, String>> handleData(DataAccessException exception) {
        Map<String, String> body = new LinkedHashMap<>();
        String raw = String.valueOf(exception.getMostSpecificCause()).toLowerCase();
        if (raw.contains("no space") || raw.contains("error 28")) {
            body.put("message", "Ổ máy chủ gần đầy, không ghi được dữ liệu. Hãy nâng dung lượng đĩa.");
            return ResponseEntity.status(HttpStatus.INSUFFICIENT_STORAGE).body(body);
        }
        body.put("message", "Không thể lưu dữ liệu, thử lại sau");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
