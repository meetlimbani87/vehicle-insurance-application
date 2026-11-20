package com.insurance.vehicle.common.dummy;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Plain in-memory stand-in for the future JPA `Claim` entity.
 * Mirrors the frontend's src/mock/mockClaims.ts field-for-field
 * (status/eligibility/severity kept as plain Strings during the dummy-data phase).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimRecord {
    private String id;
    private String claimNumber;
    private String policyId;
    private String policyNumber;
    private String accidentDate;
    private String location;
    private String description;
    private String status; // "Filed" | "Under Review" | "Approved" | "Rejected" | "Closed"
    private Integer estimatedAmount;
    private Integer actualAmount;
    private String filedDate;
    private String vehicleMake;
    private String vehicleModel;
    private String registrationNo;
    private DamageAssessmentRecord damageAssessment;
    private List<String> notes;
    private List<String> photos;
}
