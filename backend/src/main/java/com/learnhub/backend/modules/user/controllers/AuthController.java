package com.learnhub.backend.modules.user.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learnhub.backend.modules.user.dtos.LoginReponse;
import com.learnhub.backend.modules.user.dtos.LoginRequest;
import com.learnhub.backend.modules.user.dtos.RegisterRequest;
import com.learnhub.backend.modules.user.dtos.userDTO;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserServicesInterfaces userServices;

    public AuthController(UserServicesInterfaces userServices) {
        this.userServices = userServices;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginReponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(userServices.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<LoginReponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userServices.register(request));
    }

    @GetMapping("/me")
    public ResponseEntity<userDTO> me(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(userServices.me(authorization));
    }
}
