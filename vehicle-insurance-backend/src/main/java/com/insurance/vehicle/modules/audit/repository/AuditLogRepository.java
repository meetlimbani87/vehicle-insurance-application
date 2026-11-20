package com.insurance.vehicle.modules.audit.repository;

import com.insurance.vehicle.modules.audit.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    // Powers the (future) admin Audit Logs page - newest activity first
    List<AuditLog> findAllByOrderByCreatedAtDesc();
}
