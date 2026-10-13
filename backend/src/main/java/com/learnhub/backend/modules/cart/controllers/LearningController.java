package com.learnhub.backend.modules.cart.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learnhub.backend.modules.cart.dtos.LearningItemDTO;
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
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(learningService.listMine(authorization));
    }
}
