package com.insurance.vehicle.modules.claim.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One individual damage point within a claim's damage assessment
 * (e.g. "Front Bumper" / "High" / "Cracked and displaced bumper").
 * Backs the "claim_damage_points" table.
 */
@Entity
@Table(name = "claim_damage_points")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimDamagePoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;

    @Column(nullable = false)
    private String area;

    @Column(nullable = false)
    private String severity; // "Low" | "Medium" | "High" | "Critical"

    @Column(nullable = false, length = 500)
    private String description;
}
