package com.learnhub.backend.modules.instructor.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learnhub.backend.modules.instructor.dtos.InstructorOnboardingDTO;
import com.learnhub.backend.modules.instructor.dtos.InstructorOnboardingRequest;
import com.learnhub.backend.modules.instructor.dtos.InstructorPerformanceDTO;
import com.learnhub.backend.modules.instructor.dtos.InstructorStudioDTO;
import com.learnhub.backend.modules.instructor.services.InstructorPerformanceService;
import com.learnhub.backend.modules.instructor.services.InstructorServices;

@RestController
@RequestMapping("/api/instructor")
public class InstructorController {
    private final InstructorServices instructorServices;
    private final InstructorPerformanceService performanceService;

    public InstructorController(
            InstructorServices instructorServices,
            InstructorPerformanceService performanceService) {
        this.instructorServices = instructorServices;
        this.performanceService = performanceService;
    }

    @GetMapping("/onboarding")
    public ResponseEntity<InstructorOnboardingDTO> onboarding(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(instructorServices.getOnboarding(authorization));
    }

    @PostMapping("/onboarding")
    public ResponseEntity<InstructorOnboardingDTO> saveOnboarding(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody InstructorOnboardingRequest request) {
        return ResponseEntity.ok(instructorServices.saveOnboarding(authorization, request));
    }

    @GetMapping("/studio")
    public ResponseEntity<InstructorStudioDTO> studio(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(instructorServices.studio(authorization));
    }

    @GetMapping("/performance")
    public ResponseEntity<InstructorPerformanceDTO> performance(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(performanceService.stats(authorization));
    }
}
