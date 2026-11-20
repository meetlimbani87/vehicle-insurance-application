package com.insurance.vehicle.modules.ai.controller;

import com.insurance.vehicle.modules.ai.dto.PolicyAiAnalysisResponse;
import com.insurance.vehicle.modules.ai.service.AiPolicyAnalysisService;
import com.insurance.vehicle.security.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/policies")
public class PolicyAiAnalysisController {

    private final AiPolicyAnalysisService aiPolicyAnalysisService;

    public PolicyAiAnalysisController(AiPolicyAnalysisService aiPolicyAnalysisService) {
        this.aiPolicyAnalysisService = aiPolicyAnalysisService;
    }

    // POST /api/policies/{policyId}/ai-analysis - triggers AI structured extraction for an uploaded policy document
    @PostMapping("/{policyId}/ai-analysis")
    public ResponseEntity<PolicyAiAnalysisResponse> analyzePolicy(
            @PathVariable UUID policyId,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        String documentUrl = body != null ? body.get("documentUrl") : null;
        PolicyAiAnalysisResponse response = aiPolicyAnalysisService.analyzePolicyDocument(
                policyId, currentUser.getUser(), documentUrl
        );
        return ResponseEntity.ok(response);
    }

    // GET /api/policies/{policyId}/ai-analysis - retrieves latest saved AI analysis
    @GetMapping("/{policyId}/ai-analysis")
    public ResponseEntity<PolicyAiAnalysisResponse> getLatestAnalysis(
            @PathVariable UUID policyId,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        PolicyAiAnalysisResponse response = aiPolicyAnalysisService.getLatestAnalysis(
                policyId, currentUser.getUser()
        );
        return ResponseEntity.ok(response);
    }

    // POST /api/policies/extract-preview - extracts facts from an unpersisted document to auto-fill policy creation form
    @PostMapping(value = "/extract-preview", consumes = "multipart/form-data")
    public ResponseEntity<com.insurance.vehicle.modules.ai.dto.PolicyExtractionResult> extractPreview(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file
    ) {
        return ResponseEntity.ok(aiPolicyAnalysisService.extractPreview(file));
    }
}
