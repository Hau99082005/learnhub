package com.learnhub.backend.modules.course.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.learnhub.backend.modules.user.exceptions.AuthException;

@Service
public class CourseImageStorage {
    private static final Set<String> ALLOWED = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/pjpeg",
            "image/png",
            "image/webp",
            "image/gif");

    private final Path folder = Paths.get(System.getProperty("user.dir"), "uploads", "courses")
            .toAbsolutePath()
            .normalize();

    public String save(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng chọn ảnh khóa học", "image");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        String originalName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        boolean allowedType = ALLOWED.contains(contentType);
        boolean allowedName = originalName.endsWith(".jpg")
                || originalName.endsWith(".jpeg")
                || originalName.endsWith(".png")
                || originalName.endsWith(".webp")
                || originalName.endsWith(".gif");
        if (!allowedType && !allowedName) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Ảnh phải là JPG, PNG, WEBP hoặc GIF", "image");
        }
        try {
            Files.createDirectories(folder);
            String storedName = UUID.randomUUID() + extensionOf(file.getOriginalFilename(), contentType);
            file.transferTo(folder.resolve(storedName).toFile());
            return "/uploads/courses/" + storedName;
        } catch (IOException exception) {
            throw new AuthException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể lưu ảnh khóa học");
        }
    }

    public void deleteIfOwned(String imageUrl) {
        if (imageUrl == null || !imageUrl.startsWith("/uploads/courses/")) {
            return;
        }
        String name = imageUrl.substring("/uploads/courses/".length());
        if (name.contains("..") || name.contains("/") || name.contains("\\")) {
            return;
        }
        try {
            Files.deleteIfExists(folder.resolve(name));
        } catch (IOException ignored) {
        }
    }

    private String extensionOf(String originalName, String contentType) {
        if (originalName != null) {
            int dot = originalName.lastIndexOf('.');
            if (dot >= 0) {
                return originalName.substring(dot).toLowerCase();
            }
        }
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };
    }
}
