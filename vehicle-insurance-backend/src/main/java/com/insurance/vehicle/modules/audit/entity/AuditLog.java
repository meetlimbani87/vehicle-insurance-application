package com.insurance.vehicle.modules.audit.entity;

import com.insurance.vehicle.common.enums.AuditAction;
import com.insurance.vehicle.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * One immutable row per tracked action ("who did what, to which record,
 * when, from where"). Rows are never updated or deleted, only inserted.
 * Maps to the `audit_logs` table created in V12__create_audit_logs_table.sql.
 */
@Entity
@Table(name = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    // Nullable on purpose: ON DELETE SET NULL means the log entry survives
    // even if the acting user's account is later deleted
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // Snapshot of the actor's display name at the time of the action, so the
    // log still reads correctly even if the user is later renamed/removed
    @Column(name = "user_name", nullable = false, length = 150)
    private String userName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AuditAction action;

    // The kind of record acted on, e.g. "Policy", "Claim" - free text rather
    // than an enum since new entity types get audited over time
    @Column(nullable = false, length = 50)
    private String entity;

    @Column(name = "entity_id", nullable = false, length = 100)
    private String entityId;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
