package com.learnhub.backend.modules.user.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learnhub.backend.modules.user.dtos.DashboardStatsDTO;
import com.learnhub.backend.modules.user.dtos.userDTO;
import com.learnhub.backend.modules.user.services.AdminDashboardService;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UserServicesInterfaces userServices;
    private final AdminDashboardService dashboardService;

    public AdminController(UserServicesInterfaces userServices, AdminDashboardService dashboardService) {
        this.userServices = userServices;
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<userDTO> dashboard(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(userServices.requireAdmin(authorization));
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> stats(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(dashboardService.stats(authorization));
    }
}
