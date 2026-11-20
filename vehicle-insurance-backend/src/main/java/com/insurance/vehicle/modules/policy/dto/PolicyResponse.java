package com.insurance.vehicle.modules.policy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Shape matches the frontend's Policy interface (src/mock/mockPolicies.ts) field-for-field.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PolicyResponse {
    private String id;
    private String policyNumber;
    private String vehicleMake;
    private String vehicleModel;
    private String vehicleYear;
    private String registrationNo;
    private String vehicleType;
    private String insuranceCompany;
    private String coverageType;
    private String startDate;
    private String endDate;
    private String status;
    private int premiumAmount;
    private String ownerName;
    private String notes;
    private List<String> documents;
}
