package com.insurance.vehicle.modules.audit.service;

import com.insurance.vehicle.common.enums.AuditAction;
import com.insurance.vehicle.modules.audit.dto.AuditLogResponse;
import com.insurance.vehicle.modules.audit.entity.AuditLog;
import com.insurance.vehicle.modules.audit.repository.AuditLogRepository;
import com.insurance.vehicle.modules.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    // Persists one audit entry. Deliberately never throws past this point:
    // a failed audit write should never roll back or block the real action
    // it's describing, so callers can fire-and-forget this after their own
    // save succeeds.
    @Override
    @Transactional
    public void record(User actor, AuditAction action, String entity, String entityId, String ipAddress) {
        AuditLog log = AuditLog.builder()
                .user(actor)
                .userName(actor.getName())
                .action(action)
                .entity(entity)
                .entityId(entityId)
                .ipAddress(ipAddress)
                .build();

        auditLogRepository.save(log);
    }

    // All logs -> flat DTO for the admin Audit Logs page.
    // Needs @Transactional: log.getUser() is lazy and open-in-view is off, so
    // without it toResponse() throws LazyInitializationException (same as Policy/Claim/Payment).
    @Override
    @Transactional(readOnly = true)
    public java.util.List<AuditLogResponse> getAllLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    // Maps one AuditLog entity to its response DTO; user id is a nullable FK
    // (account may have been deleted since), hence the null-safe check
    private AuditLogResponse toResponse(AuditLog log) {
        UUID userId = log.getUser() != null ? log.getUser().getId() : null;
        return new AuditLogResponse(
                log.getId().toString(),
                log.getCreatedAt().toString(),
                userId != null ? userId.toString() : null,
                log.getUserName(),
                log.getAction().name(),
                log.getEntity(),
                log.getEntityId(),
                log.getIpAddress()
        );
    }
}
