package com.learnhub.backend.modules.practice.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learnhub.backend.modules.practice.dtos.PracticeCourseDTO;
import com.learnhub.backend.modules.practice.dtos.PracticeQuizDTO;
import com.learnhub.backend.modules.practice.dtos.PracticeResultDTO;
import com.learnhub.backend.modules.practice.dtos.PracticeSubmitRequest;
import com.learnhub.backend.modules.practice.services.PracticeService;

@RestController
@RequestMapping("/api/practice")
public class PracticeController {
    private final PracticeService practiceService;

    public PracticeController(PracticeService practiceService) {
        this.practiceService = practiceService;
    }

    @GetMapping
    public ResponseEntity<List<PracticeCourseDTO>> list(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(practiceService.list(authorization));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<PracticeQuizDTO> quiz(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String slug) {
        return ResponseEntity.ok(practiceService.get(authorization, slug));
    }

    @PostMapping("/{slug}/submit")
    public ResponseEntity<PracticeResultDTO> submit(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String slug,
            @RequestBody(required = false) PracticeSubmitRequest request) {
        return ResponseEntity.ok(practiceService.submit(authorization, slug, request));
    }
}
