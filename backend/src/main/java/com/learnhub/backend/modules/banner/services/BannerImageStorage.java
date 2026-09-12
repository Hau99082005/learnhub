package com.learnhub.backend.modules.banner.services;

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
public class BannerImageStorage {
    private static final Set<String> ALLOWED = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif");

    private final Path folder = Paths.get(System.getProperty("user.dir"), "uploads", "banners")
            .toAbsolutePath()
            .normalize();

    public String save(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng chọn ảnh banner", "image");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (!ALLOWED.contains(contentType)) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Ảnh phải là JPG, PNG, WEBP hoặc GIF", "image");
        }
        try {
            Files.createDirectories(folder);
            String extension = extensionOf(file.getOriginalFilename(), contentType);
            String filename = UUID.randomUUID() + extension;
            Path target = folder.resolve(filename);
            file.transferTo(target.toFile());
            return "/uploads/banners/" + filename;
        } catch (IOException exception) {
            throw new AuthException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể lưu ảnh banner");
        }
    }

    public void deleteIfOwned(String imageUrl) {
        if (imageUrl == null || !imageUrl.startsWith("/uploads/banners/")) {
            return;
        }
        String name = imageUrl.substring("/uploads/banners/".length());
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
