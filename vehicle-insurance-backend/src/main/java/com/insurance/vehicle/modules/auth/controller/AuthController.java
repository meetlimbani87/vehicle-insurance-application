package com.insurance.vehicle.modules.auth.controller;

import com.insurance.vehicle.modules.auth.dto.AuthResponse;
import com.insurance.vehicle.modules.auth.dto.LoginRequest;
import com.insurance.vehicle.modules.auth.dto.RegisterRequest;
import com.insurance.vehicle.modules.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Context-path "/api" is applied globally (see application.yml), so these
 * resolve to /api/auth/login and /api/auth/register - matching lib/api.ts's
 * BASE_URL of http://localhost:5000/api.
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // POST /api/auth/login - validates the LoginRequest body (via @Valid) and returns { token, user }
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // POST /api/auth/register - validates the RegisterRequest body and returns { success: true } on 201
    @PostMapping("/register")
    public ResponseEntity<Map<String, Boolean>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true));
    }
}
