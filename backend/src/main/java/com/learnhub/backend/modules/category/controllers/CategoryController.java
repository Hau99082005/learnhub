package com.learnhub.backend.modules.category.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learnhub.backend.modules.category.dtos.categoryDTO;
import com.learnhub.backend.modules.category.services.interfaces.CategoryServicesInterfaces;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryServicesInterfaces categoryServices;

    public CategoryController(CategoryServicesInterfaces categoryServices) {
        this.categoryServices = categoryServices;
    }

    @GetMapping
    public ResponseEntity<List<categoryDTO>> listActive() {
        return ResponseEntity.ok(categoryServices.listActive());
    }
}
