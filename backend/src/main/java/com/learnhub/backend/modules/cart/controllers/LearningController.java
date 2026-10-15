package com.learnhub.backend.modules.cart.controllers;

import java.util.List;

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

import com.learnhub.backend.modules.cart.dtos.CertificateDTO;
import com.learnhub.backend.modules.cart.dtos.CourseNoteDTO;
import com.learnhub.backend.modules.cart.dtos.CourseNoteRequest;
import com.learnhub.backend.modules.cart.dtos.CoursePlayerDTO;
import com.learnhub.backend.modules.cart.dtos.LearningItemDTO;
import com.learnhub.backend.modules.cart.dtos.LearningProgressRequest;
import com.learnhub.backend.modules.cart.services.LearningService;

@RestController
@RequestMapping("/api/learning")
public class LearningController {
    private final LearningService learningService;

    public LearningController(LearningService learningService) {
        this.learningService = learningService;
    }

    @GetMapping
    public ResponseEntity<List<LearningItemDTO>> mine(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(value = "q", required = false) String query) {
        return ResponseEntity.ok(learningService.listMine(authorization, query));
    }

    @GetMapping("/certificates")
    public ResponseEntity<List<CertificateDTO>> certificates(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(learningService.listCertificates(authorization));
    }

    @GetMapping("/certificates/{code}")
    public ResponseEntity<CertificateDTO> certificate(@PathVariable String code) {
        return ResponseEntity.ok(learningService.getCertificate(code));
    }

    @GetMapping("/courses/{slug}")
    public ResponseEntity<CoursePlayerDTO> player(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String slug) {
        return ResponseEntity.ok(learningService.player(authorization, slug));
    }

    @GetMapping("/courses/{slug}/notes")
    public ResponseEntity<List<CourseNoteDTO>> notes(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String slug) {
        return ResponseEntity.ok(learningService.listNotes(authorization, slug));
    }

    @PostMapping("/courses/{slug}/notes")
    public ResponseEntity<CourseNoteDTO> createNote(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String slug,
            @RequestBody CourseNoteRequest request) {
        return ResponseEntity.ok(learningService.createNote(authorization, slug, request));
    }

    @PutMapping("/courses/{slug}/notes/{id}")
    public ResponseEntity<CourseNoteDTO> updateNote(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String slug,
            @PathVariable Long id,
            @RequestBody CourseNoteRequest request) {
        return ResponseEntity.ok(learningService.updateNote(authorization, slug, id, request));
    }

    @DeleteMapping("/courses/{slug}/notes/{id}")
    public ResponseEntity<Void> deleteNote(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String slug,
            @PathVariable Long id) {
        learningService.deleteNote(authorization, slug, id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/courses/{slug}/progress")
    public ResponseEntity<CoursePlayerDTO> progress(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String slug,
            @RequestBody(required = false) LearningProgressRequest request) {
        return ResponseEntity.ok(learningService.saveProgress(authorization, slug, request));
    }
}
