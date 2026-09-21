package com.learnhub.backend.modules.course.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.learnhub.backend.modules.course.dtos.CourseSectionDTO;
import com.learnhub.backend.modules.course.dtos.LessonDTO;
import com.learnhub.backend.modules.course.dtos.LessonRequest;
import com.learnhub.backend.modules.course.dtos.SectionRequest;
import com.learnhub.backend.modules.course.services.CourseCurriculumService;

@RestController
@RequestMapping("/api/admin/courses/{courseId}/sections")
public class AdminCourseSectionController {
    private final CourseCurriculumService curriculum;

    public AdminCourseSectionController(CourseCurriculumService curriculum) {
        this.curriculum = curriculum;
    }

    @GetMapping
    public ResponseEntity<List<CourseSectionDTO>> list(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long courseId) {
        return ResponseEntity.ok(curriculum.listAdmin(authorization, courseId));
    }

    @PostMapping
    public ResponseEntity<CourseSectionDTO> create(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long courseId,
            @RequestBody(required = false) SectionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(curriculum.createSection(authorization, courseId, request));
    }

    @PutMapping("/{sectionId}")
    public ResponseEntity<CourseSectionDTO> update(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long courseId,
            @PathVariable Long sectionId,
            @RequestBody(required = false) SectionRequest request) {
        return ResponseEntity.ok(curriculum.updateSection(authorization, courseId, sectionId, request));
    }

    @DeleteMapping("/{sectionId}")
    public ResponseEntity<Void> delete(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long courseId,
            @PathVariable Long sectionId) {
        curriculum.deleteSection(authorization, courseId, sectionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{sectionId}/move")
    public ResponseEntity<List<CourseSectionDTO>> move(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long courseId,
            @PathVariable Long sectionId,
            @RequestParam(defaultValue = "down") String direction) {
        return ResponseEntity.ok(curriculum.moveSection(authorization, courseId, sectionId, direction));
    }

    @PostMapping("/{sectionId}/lessons")
    public ResponseEntity<LessonDTO> createLesson(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long courseId,
            @PathVariable Long sectionId,
            @RequestBody(required = false) LessonRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(curriculum.createLesson(authorization, courseId, sectionId, request));
    }

    @PutMapping("/{sectionId}/lessons/{lessonId}")
    public ResponseEntity<LessonDTO> updateLesson(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long courseId,
            @PathVariable Long sectionId,
            @PathVariable Long lessonId,
            @RequestBody(required = false) LessonRequest request) {
        return ResponseEntity.ok(curriculum.updateLesson(authorization, courseId, sectionId, lessonId, request));
    }

    @DeleteMapping("/{sectionId}/lessons/{lessonId}")
    public ResponseEntity<Void> deleteLesson(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long courseId,
            @PathVariable Long sectionId,
            @PathVariable Long lessonId) {
        curriculum.deleteLesson(authorization, courseId, sectionId, lessonId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{sectionId}/lessons/{lessonId}/move")
    public ResponseEntity<List<CourseSectionDTO>> moveLesson(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long courseId,
            @PathVariable Long sectionId,
            @PathVariable Long lessonId,
            @RequestParam(defaultValue = "down") String direction) {
        return ResponseEntity.ok(curriculum.moveLesson(authorization, courseId, sectionId, lessonId, direction));
    }
}
