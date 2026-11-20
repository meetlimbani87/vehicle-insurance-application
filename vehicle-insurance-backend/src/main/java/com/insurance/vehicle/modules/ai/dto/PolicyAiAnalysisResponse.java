package com.insurance.vehicle.modules.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolicyAiAnalysisResponse {
    private UUID id;
    private UUID policyId;
    private String status; // PENDING, PROCESSING, COMPLETED, FAILED
    private PolicyExtractionResult extractionResult;
    private List<PolicyDataConflictDto> conflicts;
    private String modelProvider;
    private OffsetDateTime analyzedAt;
    private String sourceDocumentUrl;
    private String errorMessage;
    private OffsetDateTime createdAt;
}
