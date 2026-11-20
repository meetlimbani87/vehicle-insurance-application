package com.insurance.vehicle.modules.notification.entity;

import com.insurance.vehicle.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * One in-app notification for one user. Created as a side effect of other
 * modules' actions (see NotificationService.notify, called from
 * PolicyServiceImpl/ClaimServiceImpl/PaymentServiceImpl) - there's no direct
 * "create a notification" user-facing flow.
 * Maps to `notifications` (V10__create_notifications_table.sql).
 */
@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // "payment" | "claim" | "policy" | "system" - matches the frontend's Notification["type"] union exactly
    @Column(nullable = false, length = 20)
    private String type;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    // A lucide-react icon name the frontend already knows how to map (e.g. "CreditCard", "FileText")
    @Column(nullable = false, length = 30)
    private String icon;

    @Column(nullable = false)
    private boolean read;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
