package com.insurance.vehicle.modules.admin.controller;

import com.insurance.vehicle.modules.admin.dto.AdminUserListResponse;
import com.insurance.vehicle.modules.admin.dto.AdminUserUpdateRequest;
import com.insurance.vehicle.modules.admin.service.AdminUserService;
import com.insurance.vehicle.security.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

// Everything here is admin-only - see SecurityConfig's .hasRole("ADMIN") on /admin/**
@RestController
@RequestMapping("/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    // GET /api/admin/users - every user in the system
    @GetMapping
    public ResponseEntity<List<AdminUserListResponse>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    // PATCH /api/admin/users/{id}/status - suspend or reactivate an account
    @PatchMapping("/{id}/status")
    public ResponseEntity<AdminUserListResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody AdminUserUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            HttpServletRequest httpRequest
    ) {
        return ResponseEntity.ok(adminUserService.updateUserStatus(id, request, currentUser.getUser(), httpRequest.getRemoteAddr()));
    }
}
