package com.insurance.vehicle.modules.claim.entity;

import com.insurance.vehicle.modules.policy.entity.Policy;
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
 * Vehicle make/model/registration are kept as a snapshot on the claim itself
 * (not read live off the linked Policy's Vehicle) since a claim should still
 * show the vehicle details as they were at the time of filing, even if the
 * vehicle record changes later.
 */
@Entity
@Table(name = "claims")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Claim {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "claim_number", nullable = false, unique = true, length = 50)
    private String claimNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "policy_id", nullable = false)
    private Policy policy;

    @Column(name = "accident_date", nullable = false)
    private LocalDate accidentDate;

    @Column(nullable = false, length = 255)
    private String location;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    // "Filed" | "Under Review" | "Approved" | "Rejected" | "Closed" - plain
    // validated String, same convention as Policy.status's sibling fields
    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "estimated_amount")
    private Integer estimatedAmount;

    @Column(name = "actual_amount")
    private Integer actualAmount;

    @Column(name = "filed_date", nullable = false)
    private LocalDate filedDate;

    // Vehicle snapshot at time of filing (see class-level note)
    @Column(name = "vehicle_make", nullable = false, length = 100)
    private String vehicleMake;

    @Column(name = "vehicle_model", nullable = false, length = 100)
    private String vehicleModel;

    @Column(name = "registration_no", nullable = false, length = 20)
    private String registrationNo;

    // Null until a surveyor/AI assessment has actually run
    @Column(name = "damage_eligibility", length = 30)
    private String damageEligibility;

    @Column(name = "ai_confidence")
    private Integer aiConfidence;

    // Individual damage points belong to this claim; cascade+orphanRemoval
    // because a damage point never makes sense detached from its claim
    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ClaimDamagePoint> damagePoints = new ArrayList<>();

    // Free-text progress notes, oldest first - kept simple as a string list
    // rather than a separate timestamped table for this first pass
    @ElementCollection
    @CollectionTable(name = "claim_notes", joinColumns = @JoinColumn(name = "claim_id"))
    @Column(name = "note", columnDefinition = "TEXT")
    @OrderColumn(name = "position")
    @Builder.Default
    private List<String> notes = new ArrayList<>();

    // URLs of uploaded accident/damage photos
    @ElementCollection
    @CollectionTable(name = "claim_photos", joinColumns = @JoinColumn(name = "claim_id"))
    @Column(name = "photo_url", length = 500)
    @OrderColumn(name = "position")
    @Builder.Default
    private List<String> photos = new ArrayList<>();

    // URLs of uploaded supporting documents (FIR, driving license, etc.)
    @ElementCollection
    @CollectionTable(name = "claim_documents", joinColumns = @JoinColumn(name = "claim_id"))
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
            this.status = "Filed";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
