package com.learnhub.backend.modules.category.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.learnhub.backend.modules.category.dtos.CategoryRequest;
import com.learnhub.backend.modules.category.dtos.categoryDTO;
import com.learnhub.backend.modules.category.services.interfaces.CategoryServicesInterfaces;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {
    private final CategoryServicesInterfaces categoryServices;

    public AdminCategoryController(CategoryServicesInterfaces categoryServices) {
        this.categoryServices = categoryServices;
    }

    @GetMapping
    public ResponseEntity<List<categoryDTO>> list(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(categoryServices.listAll(authorization));
    }

    @GetMapping("/{id}")
    public ResponseEntity<categoryDTO> detail(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id) {
        return ResponseEntity.ok(categoryServices.findById(authorization, id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<categoryDTO> create(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean status,
            @RequestParam("image") MultipartFile image) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoryServices.create(authorization, toRequest(name, status), image));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<categoryDTO> update(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean status,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(categoryServices.update(authorization, id, toRequest(name, status), image));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id) {
        categoryServices.delete(authorization, id);
        return ResponseEntity.noContent().build();
    }

    private CategoryRequest toRequest(String name, Boolean status) {
        CategoryRequest request = new CategoryRequest();
        request.setName(name);
        request.setStatus(status);
        return request;
    }
}
