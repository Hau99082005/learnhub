package com.learnhub.backend.modules.instructor.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learnhub.backend.modules.instructor.dtos.InstructorResourcesDTO;
import com.learnhub.backend.modules.instructor.dtos.SupportTicketRequest;
import com.learnhub.backend.modules.instructor.dtos.ToolCheckRequest;
import com.learnhub.backend.modules.instructor.services.InstructorResourcesService;

@RestController
@RequestMapping("/api/instructor/resources")
public class InstructorResourcesController {
    private final InstructorResourcesService resources;

    public InstructorResourcesController(InstructorResourcesService resources) {
        this.resources = resources;
    }

    @GetMapping
    public ResponseEntity<InstructorResourcesDTO> overview(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(resources.overview(authorization));
    }

    @PostMapping("/progress")
    public ResponseEntity<InstructorResourcesDTO> saveProgress(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody ToolCheckRequest request) {
        return ResponseEntity.ok(resources.saveProgress(authorization, request));
    }

    @PostMapping("/tickets")
    public ResponseEntity<InstructorResourcesDTO> createTicket(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody SupportTicketRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resources.createTicket(authorization, request));
    }

    @PostMapping("/tickets/{id}/close")
    public ResponseEntity<InstructorResourcesDTO> closeTicket(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id) {
        return ResponseEntity.ok(resources.closeTicket(authorization, id));
    }
}
