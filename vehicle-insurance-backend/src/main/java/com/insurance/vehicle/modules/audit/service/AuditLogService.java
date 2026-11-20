package com.insurance.vehicle.modules.audit.service;

import com.insurance.vehicle.common.enums.AuditAction;
import com.insurance.vehicle.modules.audit.dto.AuditLogResponse;
import com.insurance.vehicle.modules.user.entity.User;

import java.util.List;

public interface AuditLogService {

    // Writes one audit trail entry. Called by other modules' services right
    // after a tracked action succeeds (e.g. PolicyServiceImpl after a policy is created)
    void record(User actor, AuditAction action, String entity, String entityId, String ipAddress);

    // Returns every audit log entry, newest first (admin Audit Logs page)
    List<AuditLogResponse> getAllLogs();
}
