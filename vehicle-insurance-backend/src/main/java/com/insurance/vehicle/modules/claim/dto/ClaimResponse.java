package com.insurance.vehicle.modules.claim.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Shape matches the frontend's Claim interface field-for-field,
 * including top-level damage fields and nested damageAssessment structure.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimResponse {
    private String id;
    private String claimNumber;
    private String policyId;
    private String policyNumber;
    private String accidentDate;
    private String location;
    private String description;
    private String status;
    private Integer estimatedAmount;
    private Integer actualAmount;
    private String filedDate;
    private String vehicleMake;
    private String vehicleModel;
    private String registrationNo;
    private String damageEligibility;
    private Integer aiConfidence;
    private List<DamagePoint> damagePoints;
    private DamageAssessment damageAssessment;
    private List<String> notes;
    private List<String> photos;
    private List<String> documents;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DamageAssessment {
        private List<DamagePoint> points;
        private String eligibility;
        private int aiConfidence;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DamagePoint {
        private String area;
        private String severity;
        private String description;
    }
}
