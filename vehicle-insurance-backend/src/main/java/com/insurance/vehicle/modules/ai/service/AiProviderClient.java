package com.insurance.vehicle.modules.ai.service;

import com.insurance.vehicle.modules.ai.dto.PolicyExtractionResult;

public interface AiProviderClient {

    /**
     * Extracts structured insurance policy information from raw policy document text.
     * @param documentText The machine-readable text extracted from the uploaded policy document.
     * @return Validated structured extraction result.
     */
    PolicyExtractionResult extractPolicyInformation(String documentText);

    /**
     * Returns the name of the AI model / provider being used (e.g. "openai-gpt-4o", "local-rule-based").
     */
    String getProviderName();
}
