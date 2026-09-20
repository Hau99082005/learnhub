package com.learnhub.backend.modules.course.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learnhub.backend.modules.course.dtos.CourseAdminDTO;
import com.learnhub.backend.modules.course.services.CourseServices;

@RestController
@RequestMapping("/api/courses")
public class CoursePublicController {
    private final CourseServices courseServices;

    public CoursePublicController(CourseServices courseServices) {
        this.courseServices = courseServices;
    }

    @GetMapping
    public ResponseEntity<List<CourseAdminDTO>> list() {
        return ResponseEntity.ok(courseServices.listPublished());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<CourseAdminDTO> detail(@PathVariable String slug) {
        return ResponseEntity.ok(courseServices.findPublished(slug));
    }
}
