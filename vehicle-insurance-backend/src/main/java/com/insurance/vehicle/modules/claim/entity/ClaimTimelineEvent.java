package com.insurance.vehicle.modules.claim.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * One entry in a claim's real history - recorded every time the claim moves
 * to a new status (Filed, Under Review, Approved, Rejected, Closed). Read
 * back oldest-first to reconstruct "what happened to this claim, in order".
 * Maps to `claim_timeline_events` (V7__create_claim_timeline_events_table.sql).
 */
@Entity
@Table(name = "claim_timeline_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimTimelineEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(length = 500)
    private String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
