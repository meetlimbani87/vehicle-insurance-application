package com.insurance.vehicle.modules.user.entity;

import com.insurance.vehicle.common.enums.UserRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * User account. Maps to the `users` table (V1__create_users_table.sql).
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(nullable = false, length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    // "ACTIVE" | "SUSPENDED" - kept as a plain string to match the DB check constraint
    @Column(nullable = false, length = 20)
    private String status;

    // Nullable - not collected at registration, only ever set later via Profile settings
    @Column(length = 255)
    private String address;

    @Column(name = "email_notifications", nullable = false)
    private boolean emailNotifications;

    @Column(name = "sms_notifications", nullable = false)
    private boolean smsNotifications;

    @Column(name = "in_app_notifications", nullable = false)
    private boolean inAppNotifications;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) {
            this.status = "ACTIVE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
