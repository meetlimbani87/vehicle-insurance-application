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
public class ClaimAiAssessmentResult {

    private String eligibility; // "Eligible" | "Needs Review" | "Ineligible"
    private Double confidence; // 0.0 - 1.0
    private Double approvalProbability; // 0.0 - 1.0 (Final Claim Acceptance Chance %)
    private Integer photoConsistencyScore; // 0 to 100%
    private Integer estimatedAmount;
    private String reasoning;
    private String recommendedAction; // "Approve" | "Manual Review" | "Reject"

    @Builder.Default
    private List<ClaimDamagePointDto> damagePoints = new ArrayList<>();

    @Builder.Default
    private List<VisualDamagePointDto> visualDamagePoints = new ArrayList<>();

    private PaymentHealthSummaryDto paymentHealthSummary;

    @Builder.Default
    private List<SurveyorQuestionGuideDto> surveyorQuestions = new ArrayList<>();

    private UnderwriterRecommendationDto underwriterRecommendation;

    @Builder.Default
    private List<String> checkedCoverages = new ArrayList<>();

    @Builder.Default
    private List<String> flaggedExclusions = new ArrayList<>();

    @Builder.Default
    private List<String> warnings = new ArrayList<>();
}
