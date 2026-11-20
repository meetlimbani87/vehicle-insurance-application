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
public class UnderwriterRecommendationDto {

    private String riskLevel; // "Low Risk" | "Moderate Risk" | "High Risk"
    private Integer fraudScore; // 0 to 100
    private String approvalRecommendation; // "Fast-Track Approve" | "Standard Review" | "Request Documents" | "Reject"
    private Boolean fastTrackEligible;
    private String reasoningSummary;

    @Builder.Default
    private List<String> verifiedChecklist = new ArrayList<>();

    @Builder.Default
    private List<String> riskFactors = new ArrayList<>();
}
