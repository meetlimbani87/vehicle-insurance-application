package com.insurance.vehicle.modules.ai.service;

import com.insurance.vehicle.modules.ai.dto.PolicyAiAnalysisResponse;
import com.insurance.vehicle.modules.ai.dto.PolicyExtractionResult;
import com.insurance.vehicle.modules.user.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface AiPolicyAnalysisService {

    /**
     * Runs AI policy document extraction on an uploaded document belonging to the specified policy.
     */
    PolicyAiAnalysisResponse analyzePolicyDocument(UUID policyId, User currentUser, String documentUrl);

    /**
     * Gets the latest AI analysis for a policy, enforcing ownership/admin security.
     */
    PolicyAiAnalysisResponse getLatestAnalysis(UUID policyId, User currentUser);

    /**
     * Extracts policy information from an uploaded document file before policy creation (for auto-filling the form).
     */
    PolicyExtractionResult extractPreview(MultipartFile file);
}
