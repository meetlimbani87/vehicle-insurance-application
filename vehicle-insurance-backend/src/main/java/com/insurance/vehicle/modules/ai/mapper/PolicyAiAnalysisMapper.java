package com.insurance.vehicle.modules.ai.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurance.vehicle.modules.ai.dto.*;
import com.insurance.vehicle.modules.ai.entity.PolicyAiAnalysis;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class PolicyAiAnalysisMapper {

    private final ObjectMapper objectMapper;

    public PolicyAiAnalysisMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public PolicyAiAnalysisResponse toResponse(PolicyAiAnalysis entity) {
        if (entity == null) {
            return null;
        }

        PolicyExtractionResult extractionResult = null;
        if (entity.getRawStructuredResult() != null && !entity.getRawStructuredResult().isBlank()) {
            try {
                extractionResult = objectMapper.readValue(entity.getRawStructuredResult(), PolicyExtractionResult.class);
            } catch (JsonProcessingException e) {
                extractionResult = buildFallbackExtractionResult(entity);
            }
        } else {
            extractionResult = buildFallbackExtractionResult(entity);
        }

        List<PolicyDataConflictDto> conflicts = new ArrayList<>();
        if (entity.getConflicts() != null && !entity.getConflicts().isBlank()) {
            try {
                conflicts = objectMapper.readValue(entity.getConflicts(), new TypeReference<List<PolicyDataConflictDto>>() {});
            } catch (JsonProcessingException e) {
                conflicts = new ArrayList<>();
            }
        }

        return PolicyAiAnalysisResponse.builder()
                .id(entity.getId())
                .policyId(entity.getPolicy() != null ? entity.getPolicy().getId() : null)
                .status(entity.getStatus())
                .extractionResult(extractionResult)
                .conflicts(conflicts)
                .modelProvider(entity.getModelProvider())
                .analyzedAt(entity.getAnalyzedAt())
                .sourceDocumentUrl(entity.getSourceDocumentUrl())
                .errorMessage(entity.getErrorMessage())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private PolicyExtractionResult buildFallbackExtractionResult(PolicyAiAnalysis entity) {
        PolicyExtractionResult res = new PolicyExtractionResult();
        res.setPolicyNumber(entity.getPolicyNumberExtracted());
        res.setInsuranceCompany(entity.getInsurerExtracted());
        res.setPolicyholderName(entity.getPolicyholderNameExtracted());
        res.setConfidence(entity.getConfidence());

        ExtractedCoverageDto cov = new ExtractedCoverageDto();
        cov.setStartDate(entity.getStartDateExtracted());
        cov.setEndDate(entity.getEndDateExtracted());
        cov.setInsuredDeclaredValue(entity.getIdvExtracted());
        cov.setDeductible(entity.getDeductibleExtracted());
        res.setCoverage(cov);

        ExtractedPaymentDto pay = new ExtractedPaymentDto();
        pay.setTotalPremium(entity.getPremiumExtracted());
        pay.setPaymentInterval(entity.getPaymentIntervalExtracted());
        res.setPayment(pay);

        return res;
    }
}
