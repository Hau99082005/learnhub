package com.learnhub.backend.modules.course.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.learnhub.backend.modules.course.dtos.VideoInitRequest;
import com.learnhub.backend.modules.course.dtos.VideoReadyDTO;
import com.learnhub.backend.modules.course.dtos.VideoSessionDTO;
import com.learnhub.backend.modules.course.services.CourseVideoStorage;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;

@RestController
@RequestMapping("/api/admin/courses/videos")
public class AdminCourseVideoController {
    private final CourseVideoStorage videos;
    private final UserServicesInterfaces userServices;

    public AdminCourseVideoController(CourseVideoStorage videos, UserServicesInterfaces userServices) {
        this.videos = videos;
        this.userServices = userServices;
    }

    @PostMapping
    public ResponseEntity<VideoSessionDTO> init(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody VideoInitRequest request) {
        userServices.requireAdmin(authorization);
        return ResponseEntity.status(HttpStatus.CREATED).body(videos.init(request));
    }

    @PutMapping(value = "/{sessionId}/chunks/{index}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> chunk(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String sessionId,
            @PathVariable int index,
            @RequestParam("chunk") MultipartFile chunk) {
        userServices.requireAdmin(authorization);
        videos.saveChunk(sessionId, index, chunk);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{sessionId}/complete")
    public ResponseEntity<VideoReadyDTO> complete(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String sessionId) {
        userServices.requireAdmin(authorization);
        return ResponseEntity.ok(videos.complete(sessionId));
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> abort(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String sessionId) {
        userServices.requireAdmin(authorization);
        videos.abort(sessionId);
        return ResponseEntity.noContent().build();
    }
}
