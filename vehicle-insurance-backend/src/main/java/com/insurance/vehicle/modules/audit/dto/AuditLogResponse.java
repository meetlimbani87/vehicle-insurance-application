package com.insurance.vehicle.modules.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Shape matches the frontend's AuditLog interface (src/mock/mockAuditLogs.ts) field-for-field.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private String id;
    private String timestamp;
    private String userId;
    private String userName;
    private String action;
    private String entity;
    private String entityId;
    private String ip;
}
