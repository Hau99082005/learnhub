package com.learnhub.backend.modules.user.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learnhub.backend.modules.user.dtos.userDTO;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UserServicesInterfaces userServices;

    public AdminController(UserServicesInterfaces userServices) {
        this.userServices = userServices;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<userDTO> dashboard(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(userServices.requireAdmin(authorization));
    }
}
