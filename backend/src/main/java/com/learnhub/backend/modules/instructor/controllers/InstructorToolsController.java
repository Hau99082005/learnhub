package com.learnhub.backend.modules.instructor.controllers;

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
import org.springframework.web.bind.annotation.RestController;

import com.learnhub.backend.modules.instructor.dtos.ApplyTemplateRequest;
import com.learnhub.backend.modules.instructor.dtos.CopyTemplateRequest;
import com.learnhub.backend.modules.instructor.dtos.InstructorBankRequest;
import com.learnhub.backend.modules.instructor.dtos.InstructorToolsDTO;
import com.learnhub.backend.modules.instructor.dtos.PublishRequest;
import com.learnhub.backend.modules.instructor.dtos.ToolCheckRequest;
import com.learnhub.backend.modules.instructor.services.InstructorToolsService;

@RestController
@RequestMapping("/api/instructor/tools")
public class InstructorToolsController {
    private final InstructorToolsService tools;

    public InstructorToolsController(InstructorToolsService tools) {
        this.tools = tools;
    }

    @GetMapping
    public ResponseEntity<InstructorToolsDTO> overview(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(tools.overview(authorization));
    }

    @PostMapping("/checks")
    public ResponseEntity<InstructorToolsDTO> saveCheck(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody ToolCheckRequest request) {
        return ResponseEntity.ok(tools.saveCheck(authorization, request));
    }

    @PostMapping("/templates")
    public ResponseEntity<InstructorToolsDTO> createTemplate(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody CopyTemplateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tools.createTemplate(authorization, request));
    }

    @PutMapping("/templates/{id}")
    public ResponseEntity<InstructorToolsDTO> updateTemplate(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id,
            @RequestBody CopyTemplateRequest request) {
        return ResponseEntity.ok(tools.updateTemplate(authorization, id, request));
    }

    @DeleteMapping("/templates/{id}")
    public ResponseEntity<InstructorToolsDTO> deleteTemplate(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id) {
        return ResponseEntity.ok(tools.deleteTemplate(authorization, id));
    }

    @PostMapping("/templates/{id}/apply")
    public ResponseEntity<InstructorToolsDTO> applyTemplate(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id,
            @RequestBody ApplyTemplateRequest request) {
        return ResponseEntity.ok(tools.applyTemplate(authorization, id, request));
    }

    @PostMapping("/publish")
    public ResponseEntity<InstructorToolsDTO> publish(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody PublishRequest request) {
        return ResponseEntity.ok(tools.publish(authorization, request));
    }

    @PostMapping("/unpublish")
    public ResponseEntity<InstructorToolsDTO> unpublish(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody PublishRequest request) {
        return ResponseEntity.ok(tools.unpublish(authorization, request));
    }

    @PostMapping("/bank")
    public ResponseEntity<InstructorToolsDTO> saveBank(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody InstructorBankRequest request) {
        return ResponseEntity.ok(tools.saveBank(authorization, request));
    }

    @DeleteMapping("/bank")
    public ResponseEntity<InstructorToolsDTO> deleteBank(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(tools.deleteBank(authorization));
    }
}
