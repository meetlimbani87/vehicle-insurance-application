package com.insurance.vehicle.modules.audit.controller;

import com.insurance.vehicle.modules.audit.dto.AuditLogResponse;
import com.insurance.vehicle.modules.audit.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Admin-only - see SecurityConfig's .hasRole("ADMIN") on /admin/**
@RestController
@RequestMapping("/admin/audit-logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    // GET /api/admin/audit-logs - every audit log entry, newest first
    @GetMapping
    public ResponseEntity<List<AuditLogResponse>> getAllLogs() {
        return ResponseEntity.ok(auditLogService.getAllLogs());
    }
}
