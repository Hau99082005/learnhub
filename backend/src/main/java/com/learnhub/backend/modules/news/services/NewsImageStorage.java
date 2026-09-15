package com.learnhub.backend.modules.news.services;

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
public class NewsImageStorage {
    private static final Set<String> FOLDERS = Set.of("news", "newsblogs");
    private static final Set<String> ALLOWED = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif");

    public String save(MultipartFile file, String folder) {
        if (!FOLDERS.contains(folder)) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Thư mục ảnh không hợp lệ", "image");
        }
        if (file == null || file.isEmpty()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng chọn ảnh", "image");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (!ALLOWED.contains(contentType)) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Ảnh phải là JPG, PNG, WEBP hoặc GIF", "image");
        }
        Path dir = Paths.get(System.getProperty("user.dir"), "uploads", folder).toAbsolutePath().normalize();
        try {
            Files.createDirectories(dir);
            String extension = extensionOf(file.getOriginalFilename(), contentType);
            String filename = UUID.randomUUID() + extension;
            file.transferTo(dir.resolve(filename).toFile());
            return "/uploads/" + folder + "/" + filename;
        } catch (IOException exception) {
            throw new AuthException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể lưu ảnh");
        }
    }

    public void deleteIfOwned(String imageUrl, String folder) {
        if (!FOLDERS.contains(folder) || imageUrl == null) {
            return;
        }
        String prefix = "/uploads/" + folder + "/";
        if (!imageUrl.startsWith(prefix)) {
            return;
        }
        String name = imageUrl.substring(prefix.length());
        if (name.contains("..") || name.contains("/") || name.contains("\\")) {
            return;
        }
        Path dir = Paths.get(System.getProperty("user.dir"), "uploads", folder).toAbsolutePath().normalize();
        try {
            Files.deleteIfExists(dir.resolve(name));
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
