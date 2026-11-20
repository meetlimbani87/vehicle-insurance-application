package com.insurance.vehicle.modules.policy.entity;

import com.insurance.vehicle.common.enums.PolicyStatus;
import com.insurance.vehicle.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Insurance policy. Owned by one User and covers one Vehicle.
 * Maps to the `policies` table (V4__create_policies_table.sql).
 */
@Entity
@Table(name = "policies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Policy {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    // The customer who owns this policy - always the logged-in user who created it
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // The vehicle this policy covers - may be shared with an earlier/renewed policy
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "policy_number", nullable = false, unique = true, length = 50)
    private String policyNumber;

    @Column(name = "insurance_company", nullable = false, length = 150)
    private String insuranceCompany;

    // "comprehensive" | "third-party" | "own-damage" - plain validated String,
    // same reasoning as Vehicle.vehicleType
    @Column(name = "coverage_type", nullable = false, length = 20)
    private String coverageType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PolicyStatus status;

    @Column(name = "premium_amount", nullable = false)
    private int premiumAmount;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // URLs of supporting documents uploaded during creation (RC, PUC, previous policy)
    @ElementCollection
    @CollectionTable(name = "policy_documents", joinColumns = @JoinColumn(name = "policy_id"))
    @Column(name = "document_url", length = 500)
    @OrderColumn(name = "position")
    @Builder.Default
    private List<String> documents = new ArrayList<>();

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
            this.status = PolicyStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
