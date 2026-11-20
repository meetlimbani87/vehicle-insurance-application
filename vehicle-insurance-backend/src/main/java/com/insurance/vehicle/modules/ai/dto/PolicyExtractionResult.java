package com.insurance.vehicle.modules.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolicyExtractionResult {

    private String policyNumber;
    private String insuranceCompany;
    private String policyholderName;

    @Builder.Default
    private ExtractedVehicleDto vehicle = new ExtractedVehicleDto();

    @Builder.Default
    private ExtractedCoverageDto coverage = new ExtractedCoverageDto();

    @Builder.Default
    private ExtractedPaymentDto payment = new ExtractedPaymentDto();

    @Builder.Default
    private List<String> includedCoverage = new ArrayList<>();

    @Builder.Default
    private List<String> exclusions = new ArrayList<>();

    @Builder.Default
    private List<String> claimRequirements = new ArrayList<>();

    @Builder.Default
    private List<String> limits = new ArrayList<>();

    @Builder.Default
    private List<String> specialConditions = new ArrayList<>();

    @Builder.Default
    private List<String> warnings = new ArrayList<>();

    @Builder.Default
    private Double confidence = 0.0;
}
