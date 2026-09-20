package com.learnhub.backend.modules.course.controllers;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.ResourceRegion;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRange;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learnhub.backend.modules.course.services.CourseVideoStorage;
import com.learnhub.backend.modules.user.exceptions.AuthException;

@RestController
@RequestMapping("/api/media/videos")
public class VideoStreamController {
    private static final long CHUNK = 1024 * 1024;

    private final CourseVideoStorage videos;

    public VideoStreamController(CourseVideoStorage videos) {
        this.videos = videos;
    }

    @GetMapping("/{node}/{filename}")
    public ResponseEntity<ResourceRegion> stream(
            @PathVariable String node,
            @PathVariable String filename,
            @RequestHeader HttpHeaders headers) throws IOException {
        Path file = videos.resolvePublished(node, filename);
        if (file == null) {
            throw new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy video");
        }
        Resource resource = new FileSystemResource(file);
        long length = Files.size(file);
        HttpStatus status = headers.getRange().isEmpty() ? HttpStatus.OK : HttpStatus.PARTIAL_CONTENT;
        return ResponseEntity.status(status)
                .contentType(MediaTypeFactory.getMediaType(resource).orElse(MediaType.parseMediaType("video/mp4")))
                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                .body(toRegion(resource, headers, length));
    }

    private ResourceRegion toRegion(Resource resource, HttpHeaders headers, long length) {
        ListRange range = firstRange(headers, length);
        if (range == null) {
            return new ResourceRegion(resource, 0, length);
        }
        long start = range.start;
        long end = range.end;
        long take = Math.min(CHUNK, end - start + 1);
        return new ResourceRegion(resource, start, take);
    }

    private ListRange firstRange(HttpHeaders headers, long length) {
        if (headers.getRange().isEmpty() || length <= 0) {
            return null;
        }
        HttpRange range = headers.getRange().get(0);
        long start = range.getRangeStart(length);
        long end = range.getRangeEnd(length);
        return new ListRange(start, end);
    }

    private record ListRange(long start, long end) {
    }
}
