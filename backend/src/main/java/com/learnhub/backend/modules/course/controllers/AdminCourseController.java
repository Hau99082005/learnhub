package com.learnhub.backend.modules.course.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.learnhub.backend.modules.course.dtos.AdminCourseRequest;
import com.learnhub.backend.modules.course.dtos.CourseAdminDTO;
import com.learnhub.backend.modules.course.dtos.CourseInstructorOptionDTO;
import com.learnhub.backend.modules.course.services.CourseServices;

@RestController
@RequestMapping("/api/admin/courses")
public class AdminCourseController {
    private final CourseServices courseServices;

    public AdminCourseController(CourseServices courseServices) {
        this.courseServices = courseServices;
    }

    @GetMapping
    public ResponseEntity<List<CourseAdminDTO>> list(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(courseServices.listAll(authorization));
    }

    @GetMapping("/instructors")
    public ResponseEntity<List<CourseInstructorOptionDTO>> instructors(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(courseServices.listInstructors(authorization));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CourseAdminDTO> create(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(required = false) String instructorId,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String subtitle,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String price,
            @RequestParam(required = false) String compareAtPrice,
            @RequestParam(required = false) String currency,
            @RequestParam(required = false) String isFree,
            @RequestParam(required = false) String issuesCertificate,
            @RequestParam(required = false) String durationSeconds,
            @RequestParam(required = false) String whatYouWillLearn,
            @RequestParam(required = false) String requirements,
            @RequestParam(required = false) String previewVideo,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(courseServices.create(authorization, toRequest(
                        instructorId,
                        categoryId,
                        title,
                        subtitle,
                        description,
                        language,
                        level,
                        status,
                        price,
                        compareAtPrice,
                        currency,
                        isFree,
                        issuesCertificate,
                        durationSeconds,
                        whatYouWillLearn,
                        requirements,
                        previewVideo), image));
    }

    @RequestMapping(value = "/{id}", method = { RequestMethod.POST, RequestMethod.PUT }, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CourseAdminDTO> update(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id,
            @RequestParam(required = false) String instructorId,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String subtitle,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String price,
            @RequestParam(required = false) String compareAtPrice,
            @RequestParam(required = false) String currency,
            @RequestParam(required = false) String isFree,
            @RequestParam(required = false) String issuesCertificate,
            @RequestParam(required = false) String durationSeconds,
            @RequestParam(required = false) String whatYouWillLearn,
            @RequestParam(required = false) String requirements,
            @RequestParam(required = false) String previewVideo,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(courseServices.update(authorization, id, toRequest(
                instructorId,
                categoryId,
                title,
                subtitle,
                description,
                language,
                level,
                status,
                price,
                compareAtPrice,
                currency,
                isFree,
                issuesCertificate,
                durationSeconds,
                whatYouWillLearn,
                requirements,
                previewVideo), image));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id) {
        courseServices.delete(authorization, id);
        return ResponseEntity.noContent().build();
    }

    private AdminCourseRequest toRequest(
            String instructorId,
            String categoryId,
            String title,
            String subtitle,
            String description,
            String language,
            String level,
            String status,
            String price,
            String compareAtPrice,
            String currency,
            String isFree,
            String issuesCertificate,
            String durationSeconds,
            String whatYouWillLearn,
            String requirements,
            String previewVideo) {
        AdminCourseRequest request = new AdminCourseRequest();
        request.setInstructorId(parseLong(instructorId));
        request.setCategoryId(parseLong(categoryId));
        request.setTitle(title);
        request.setSubtitle(subtitle);
        request.setDescription(description);
        request.setLanguage(language);
        request.setLevel(level);
        request.setStatus(status);
        request.setPrice(price);
        request.setCompareAtPrice(compareAtPrice);
        request.setCurrency(currency);
        request.setIsFree(parseBoolean(isFree));
        request.setIssuesCertificate(parseBoolean(issuesCertificate));
        request.setDurationSeconds(parseInt(durationSeconds));
        request.setWhatYouWillLearn(whatYouWillLearn);
        request.setRequirements(requirements);
        request.setPreviewVideo(previewVideo);
        return request;
    }

    private Long parseLong(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Long.valueOf(value.trim());
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private Integer parseInt(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Integer.valueOf(value.trim());
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private Boolean parseBoolean(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return Boolean.parseBoolean(value.trim());
    }
}
