package com.insurance.vehicle.common.dummy;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Plain in-memory stand-in for the future JPA `Policy` entity.
 * Field names/types mirror the frontend's src/mock/mockPolicies.ts exactly
 * (status/vehicleType/coverageType kept as plain Strings for now to avoid
 * enum <-> JSON mapping churn during the dummy-data phase).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PolicyRecord {
    private String id;
    private String policyNumber;
    private String vehicleMake;
    private String vehicleModel;
    private String vehicleYear;
    private String registrationNo;
    private String vehicleType; // "two-wheeler" | "car" | "suv" | "commercial"
    private String insuranceCompany;
    private String coverageType; // "comprehensive" | "third-party" | "own-damage"
    private String startDate;
    private String endDate;
    private String status; // "Active" | "Expired" | "Renewed" | "Cancelled" | "Pending"
    private int premiumAmount;
    private String ownerName;
    private String notes;
}
