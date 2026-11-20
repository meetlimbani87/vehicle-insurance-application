package com.insurance.vehicle.modules.policy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Body of POST /api/policies. Field-for-field match of the frontend's
 * CreatePolicyInput (src/schemas/policySchemas.ts: vehicleStepSchema +
 * policyStepSchema merged) - the three-step wizard form submits exactly
 * this shape in one request once the user reaches the final step.
 */
@Data
public class PolicyCreateRequest {

    // --- vehicle step ---

    @NotBlank(message = "Vehicle make is required")
    @Size(max = 40, message = "Too long — 40 characters max")
    private String vehicleMake;

    @NotBlank(message = "Vehicle model is required")
    @Size(max = 40, message = "Too long — 40 characters max")
    private String vehicleModel;

    @Pattern(regexp = "^\\d{4}$", message = "Enter a valid 4-digit year")
    private String vehicleYear;

    @Size(min = 4, max = 11, message = "Registration number must be 4-11 characters")
    @Pattern(regexp = "^[A-Za-z0-9\\- ]+$", message = "Only letters, numbers, spaces, and hyphens allowed")
    private String registrationNo;

    @Pattern(regexp = "^(two-wheeler|car|suv|commercial)$", message = "Invalid vehicle type")
    private String vehicleType;

    // --- policy step ---

    @NotBlank(message = "Policy number is required")
    @Size(max = 30, message = "Too long — 30 characters max")
    private String policyNumber;

    @NotBlank(message = "Insurance company is required")
    @Size(max = 80, message = "Too long — 80 characters max")
    private String insuranceCompany;

    @NotBlank(message = "Start date is required")
    private String startDate;

    @NotBlank(message = "End date is required")
    private String endDate;

    @Pattern(regexp = "^(comprehensive|third-party|own-damage)$", message = "Invalid coverage type")
    private String coverageType;

    // --- payment step ---

    @Pattern(regexp = "^(one-time|monthly|quarterly|half-yearly|annually)$", message = "Invalid payment interval")
    private String paymentInterval;

    @NotBlank(message = "First payment date is required")
    private String firstPaymentDate;
}
