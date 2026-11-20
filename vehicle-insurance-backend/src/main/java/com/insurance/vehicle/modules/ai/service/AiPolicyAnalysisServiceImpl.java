package com.insurance.vehicle.modules.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurance.vehicle.common.enums.AuditAction;
import com.insurance.vehicle.common.enums.UserRole;
import com.insurance.vehicle.common.exception.BadRequestException;
import com.insurance.vehicle.common.exception.ForbiddenException;
import com.insurance.vehicle.common.exception.ResourceNotFoundException;
import com.insurance.vehicle.modules.ai.dto.*;
import com.insurance.vehicle.modules.ai.entity.PolicyAiAnalysis;
import com.insurance.vehicle.modules.ai.mapper.PolicyAiAnalysisMapper;
import com.insurance.vehicle.modules.ai.repository.PolicyAiAnalysisRepository;
import com.insurance.vehicle.modules.audit.service.AuditLogService;
import com.insurance.vehicle.modules.policy.entity.Policy;
import com.insurance.vehicle.modules.policy.repository.PolicyRepository;
import com.insurance.vehicle.modules.user.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AiPolicyAnalysisServiceImpl implements AiPolicyAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(AiPolicyAnalysisServiceImpl.class);

    private final PolicyRepository policyRepository;
    private final PolicyAiAnalysisRepository analysisRepository;
    private final DocumentTextExtractor documentTextExtractor;
    private final AiProviderClient aiProviderClient;
    private final PolicyAiAnalysisMapper mapper;
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    public AiPolicyAnalysisServiceImpl(
            PolicyRepository policyRepository,
            PolicyAiAnalysisRepository analysisRepository,
            DocumentTextExtractor documentTextExtractor,
            AiProviderClient aiProviderClient,
            PolicyAiAnalysisMapper mapper,
            AuditLogService auditLogService,
            ObjectMapper objectMapper
    ) {
        this.policyRepository = policyRepository;
        this.analysisRepository = analysisRepository;
        this.documentTextExtractor = documentTextExtractor;
        this.aiProviderClient = aiProviderClient;
        this.mapper = mapper;
        this.auditLogService = auditLogService;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public PolicyAiAnalysisResponse analyzePolicyDocument(UUID policyId, User currentUser, String documentUrlRequest) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found"));

        verifyOwnershipOrAdmin(policy, currentUser);

        // Resolve document URL
        String targetDocumentUrl = documentUrlRequest;
        if (targetDocumentUrl == null || targetDocumentUrl.isBlank()) {
            if (policy.getDocuments() != null && !policy.getDocuments().isEmpty()) {
                targetDocumentUrl = policy.getDocuments().get(policy.getDocuments().size() - 1);
            } else {
                throw new BadRequestException("No uploaded document found for this policy. Please upload a policy document first.");
            }
        }

        try {
            // Extract text from uploaded file
            String textContent = documentTextExtractor.extractText(targetDocumentUrl);

            // Call AI provider client
            PolicyExtractionResult extraction = aiProviderClient.extractPolicyInformation(textContent);

            // Compare extracted fields against DB entity to produce conflict warnings
            List<PolicyDataConflictDto> conflicts = detectConflicts(policy, extraction);

            String rawJson = objectMapper.writeValueAsString(extraction);
            String conflictsJson = objectMapper.writeValueAsString(conflicts);

            PolicyAiAnalysis analysis = PolicyAiAnalysis.builder()
                    .policy(policy)
                    .status("COMPLETED")
                    .policyNumberExtracted(extraction.getPolicyNumber())
                    .insurerExtracted(extraction.getInsuranceCompany())
                    .policyholderNameExtracted(extraction.getPolicyholderName())
                    .startDateExtracted(extraction.getCoverage() != null ? extraction.getCoverage().getStartDate() : null)
                    .endDateExtracted(extraction.getCoverage() != null ? extraction.getCoverage().getEndDate() : null)
                    .premiumExtracted(extraction.getPayment() != null ? extraction.getPayment().getTotalPremium() : null)
                    .paymentIntervalExtracted(extraction.getPayment() != null ? extraction.getPayment().getPaymentInterval() : null)
                    .idvExtracted(extraction.getCoverage() != null ? extraction.getCoverage().getInsuredDeclaredValue() : null)
                    .deductibleExtracted(extraction.getCoverage() != null ? extraction.getCoverage().getDeductible() : null)
                    .confidence(extraction.getConfidence())
                    .rawStructuredResult(rawJson)
                    .conflicts(conflictsJson)
                    .modelProvider(aiProviderClient.getProviderName())
                    .analyzedAt(OffsetDateTime.now())
                    .sourceDocumentUrl(targetDocumentUrl)
                    .build();

            PolicyAiAnalysis saved = analysisRepository.save(analysis);

            auditLogService.record(currentUser, AuditAction.CREATE, "PolicyAiAnalysis", saved.getId().toString(), null);

            return mapper.toResponse(saved);
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Policy AI analysis failed for policy {}: {}", policyId, e.getMessage(), e);

            PolicyAiAnalysis failedAnalysis = PolicyAiAnalysis.builder()
                    .policy(policy)
                    .status("FAILED")
                    .modelProvider(aiProviderClient.getProviderName())
                    .analyzedAt(OffsetDateTime.now())
                    .sourceDocumentUrl(targetDocumentUrl)
                    .errorMessage("AI extraction failed: " + e.getMessage())
                    .build();

            PolicyAiAnalysis savedFailed = analysisRepository.save(failedAnalysis);
            return mapper.toResponse(savedFailed);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PolicyAiAnalysisResponse getLatestAnalysis(UUID policyId, User currentUser) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found"));

        verifyOwnershipOrAdmin(policy, currentUser);

        PolicyAiAnalysis analysis = analysisRepository.findFirstByPolicyIdOrderByCreatedAtDesc(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("No AI analysis found for this policy"));

        return mapper.toResponse(analysis);
    }

    @Override
    public PolicyExtractionResult extractPreview(org.springframework.web.multipart.MultipartFile file) {
        String text = documentTextExtractor.extractTextFromMultipartFile(file);
        return aiProviderClient.extractPolicyInformation(text);
    }

    private void verifyOwnershipOrAdmin(Policy policy, User currentUser) {
        boolean isOwner = policy.getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("You don't have access to this policy's AI analysis");
        }
    }

    private List<PolicyDataConflictDto> detectConflicts(Policy policy, PolicyExtractionResult extraction) {
        List<PolicyDataConflictDto> conflicts = new ArrayList<>();

        if (extraction == null) return conflicts;

        // Compare Start Date
        if (extraction.getCoverage() != null && extraction.getCoverage().getStartDate() != null) {
            String extractedStart = extraction.getCoverage().getStartDate();
            String dbStart = policy.getStartDate() != null ? policy.getStartDate().toString() : "";
            if (!extractedStart.isBlank() && !dbStart.isBlank() && !extractedStart.equals(dbStart)) {
                conflicts.add(new PolicyDataConflictDto("startDate", dbStart, extractedStart));
            }
        }

        // Compare End Date
        if (extraction.getCoverage() != null && extraction.getCoverage().getEndDate() != null) {
            String extractedEnd = extraction.getCoverage().getEndDate();
            String dbEnd = policy.getEndDate() != null ? policy.getEndDate().toString() : "";
            if (!extractedEnd.isBlank() && !dbEnd.isBlank() && !extractedEnd.equals(dbEnd)) {
                conflicts.add(new PolicyDataConflictDto("endDate", dbEnd, extractedEnd));
            }
        }

        // Compare Policy Number
        if (extraction.getPolicyNumber() != null && !extraction.getPolicyNumber().isBlank()) {
            String extractedNum = extraction.getPolicyNumber();
            String dbNum = policy.getPolicyNumber();
            if (!extractedNum.equalsIgnoreCase(dbNum)) {
                conflicts.add(new PolicyDataConflictDto("policyNumber", dbNum, extractedNum));
            }
        }

        // Compare Registration Number
        if (extraction.getVehicle() != null && extraction.getVehicle().getRegistrationNo() != null) {
            String extractedReg = extraction.getVehicle().getRegistrationNo();
            String dbReg = policy.getVehicle() != null ? policy.getVehicle().getRegistrationNo() : "";
            if (!extractedReg.isBlank() && !dbReg.isBlank() && !extractedReg.equalsIgnoreCase(dbReg)) {
                conflicts.add(new PolicyDataConflictDto("registrationNo", dbReg, extractedReg));
            }
        }

        // Compare Vehicle Make
        if (extraction.getVehicle() != null && extraction.getVehicle().getMake() != null) {
            String extractedMake = extraction.getVehicle().getMake();
            String dbMake = policy.getVehicle() != null ? policy.getVehicle().getMake() : "";
            if (!extractedMake.isBlank() && !dbMake.isBlank() && !extractedMake.equalsIgnoreCase(dbMake)) {
                conflicts.add(new PolicyDataConflictDto("vehicleMake", dbMake, extractedMake));
            }
        }

        // Compare Vehicle Model
        if (extraction.getVehicle() != null && extraction.getVehicle().getModel() != null) {
            String extractedModel = extraction.getVehicle().getModel();
            String dbModel = policy.getVehicle() != null ? policy.getVehicle().getModel() : "";
            if (!extractedModel.isBlank() && !dbModel.isBlank() && !extractedModel.equalsIgnoreCase(dbModel)) {
                conflicts.add(new PolicyDataConflictDto("vehicleModel", dbModel, extractedModel));
            }
        }

        // Compare Premium
        if (extraction.getPayment() != null && extraction.getPayment().getTotalPremium() != null) {
            String extractedPrem = extraction.getPayment().getTotalPremium().replaceAll("[^0-9]", "");
            String dbPrem = String.valueOf(policy.getPremiumAmount());
            if (!extractedPrem.isBlank() && !extractedPrem.equals(dbPrem)) {
                conflicts.add(new PolicyDataConflictDto("totalPremium", "₹" + dbPrem, extraction.getPayment().getTotalPremium()));
            }
        }

        return conflicts;
    }
}
