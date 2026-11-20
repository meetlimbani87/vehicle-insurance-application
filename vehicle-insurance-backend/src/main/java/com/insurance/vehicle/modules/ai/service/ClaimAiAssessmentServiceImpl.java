package com.insurance.vehicle.modules.ai.service;

import com.insurance.vehicle.common.enums.AuditAction;
import com.insurance.vehicle.common.enums.UserRole;
import com.insurance.vehicle.common.exception.ForbiddenException;
import com.insurance.vehicle.common.exception.ResourceNotFoundException;
import com.insurance.vehicle.modules.ai.dto.*;
import com.insurance.vehicle.modules.ai.entity.PolicyAiAnalysis;
import com.insurance.vehicle.modules.ai.repository.PolicyAiAnalysisRepository;
import com.insurance.vehicle.modules.audit.service.AuditLogService;
import com.insurance.vehicle.modules.claim.dto.ClaimResponse;
import com.insurance.vehicle.modules.claim.entity.Claim;
import com.insurance.vehicle.modules.claim.entity.ClaimDamagePoint;
import com.insurance.vehicle.modules.claim.mapper.ClaimMapper;
import com.insurance.vehicle.modules.claim.repository.ClaimRepository;
import com.insurance.vehicle.modules.payment.entity.PaymentSchedule;
import com.insurance.vehicle.modules.payment.repository.PaymentScheduleRepository;
import com.insurance.vehicle.modules.policy.entity.Policy;
import com.insurance.vehicle.modules.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ClaimAiAssessmentServiceImpl implements ClaimAiAssessmentService {

    private final ClaimRepository claimRepository;
    private final PolicyAiAnalysisRepository policyAiAnalysisRepository;
    private final PaymentScheduleRepository paymentScheduleRepository;
    private final OpenAiClaimAssessmentClient openAiClaimAssessmentClient;
    private final OpenAiDamageVisionClient openAiDamageVisionClient;
    private final ClaimMapper claimMapper;
    private final AuditLogService auditLogService;

    public ClaimAiAssessmentServiceImpl(
            ClaimRepository claimRepository,
            PolicyAiAnalysisRepository policyAiAnalysisRepository,
            PaymentScheduleRepository paymentScheduleRepository,
            OpenAiClaimAssessmentClient openAiClaimAssessmentClient,
            OpenAiDamageVisionClient openAiDamageVisionClient,
            ClaimMapper claimMapper,
            AuditLogService auditLogService
    ) {
        this.claimRepository = claimRepository;
        this.policyAiAnalysisRepository = policyAiAnalysisRepository;
        this.paymentScheduleRepository = paymentScheduleRepository;
        this.openAiClaimAssessmentClient = openAiClaimAssessmentClient;
        this.openAiDamageVisionClient = openAiDamageVisionClient;
        this.claimMapper = claimMapper;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public ClaimResponse assessClaim(UUID claimId, User currentUser) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with ID: " + claimId));

        verifyOwnershipOrAdmin(claim, currentUser);

        Policy policy = claim.getPolicy();
        PolicyAiAnalysis latestPolicyAi = policyAiAnalysisRepository
                .findFirstByPolicyIdOrderByCreatedAtDesc(policy.getId())
                .orElse(null);

        // 1. Run AI text & terms assessment reasoning engine
        ClaimAiAssessmentResult assessmentResult = openAiClaimAssessmentClient.assessClaim(
                claim, policy, null
        );

        // 2. Run Multi-Modal Vision photo analysis on uploaded damage images
        OpenAiDamageVisionClient.VisionAnalysisResponse visionResult = openAiDamageVisionClient.analyzeDamagePhotos(claim);
        if (visionResult != null) {
            assessmentResult.setPhotoConsistencyScore(visionResult.getPhotoConsistencyScore());
            assessmentResult.setVisualDamagePoints(visionResult.getVisualDamagePoints());
        }

        // 3. Compute Accumulated Premiums Paid & Payment Health
        List<PaymentSchedule> schedules = paymentScheduleRepository.findAllByPolicyId(policy.getId());
        int totalPremiumsPaid = 0;
        int paidCount = 0;
        boolean hasOverdue = false;

        if (schedules != null) {
            for (PaymentSchedule s : schedules) {
                if ("Paid".equalsIgnoreCase(s.getStatus())) {
                    totalPremiumsPaid += s.getAmount();
                    paidCount++;
                } else if ("Pending".equalsIgnoreCase(s.getStatus()) && s.getDueDate() != null && s.getDueDate().isBefore(java.time.LocalDate.now())) {
                    hasOverdue = true;
                }
            }
        }

        if (totalPremiumsPaid == 0 && policy.getPremiumAmount() > 0) {
            // Default active policy premium credit if schedule generator hasn't executed
            totalPremiumsPaid = policy.getPremiumAmount();
            paidCount = 1;
        }

        String paymentHealth = hasOverdue ? "Overdue Installments" : (paidCount > 0 ? "100% On-Time" : "Good Standing");
        double ratio = (assessmentResult.getEstimatedAmount() != null && totalPremiumsPaid > 0)
                ? (double) assessmentResult.getEstimatedAmount() / totalPremiumsPaid
                : 1.0;

        PaymentHealthSummaryDto paymentSummary = PaymentHealthSummaryDto.builder()
                .totalPremiumsPaid(totalPremiumsPaid)
                .paidInstallmentsCount(paidCount)
                .totalInstallmentsCount(Math.max(schedules.size(), 1))
                .paymentStatusHealth(paymentHealth)
                .claimToPremiumRatio(Math.round(ratio * 100.0) / 100.0)
                .build();
        assessmentResult.setPaymentHealthSummary(paymentSummary);

        // 4. Calculate Final Claim Approval Probability %
        double baseConfidence = assessmentResult.getConfidence() != null ? assessmentResult.getConfidence() : 0.88;
        int photoScore = (visionResult != null && visionResult.getPhotoConsistencyScore() != null) ? visionResult.getPhotoConsistencyScore() : 90;
        double visionWeight = (photoScore / 100.0) * 0.05;
        double paymentWeight = hasOverdue ? -0.10 : 0.03;

        double finalProbability;
        if ("Ineligible".equalsIgnoreCase(assessmentResult.getEligibility())) {
            finalProbability = 0.05;
        } else if ("Needs Review".equalsIgnoreCase(assessmentResult.getEligibility())) {
            finalProbability = Math.min(0.85, Math.max(0.40, baseConfidence - 0.15 + visionWeight));
        } else {
            finalProbability = Math.min(0.98, Math.max(0.80, baseConfidence + visionWeight + paymentWeight));
        }
        assessmentResult.setApprovalProbability(Math.round(finalProbability * 100.0) / 100.0);

        // 5. Update Postgres Claim entity fields
        claim.setDamageEligibility(assessmentResult.getEligibility());
        claim.setAiConfidence((int) Math.round(finalProbability * 100));
        if (assessmentResult.getEstimatedAmount() != null) {
            claim.setEstimatedAmount(assessmentResult.getEstimatedAmount());
        }

        // Replace damage points in Postgres
        claim.getDamagePoints().clear();
        if (assessmentResult.getDamagePoints() != null) {
            List<ClaimDamagePoint> newPoints = new ArrayList<>();
            for (ClaimDamagePointDto dto : assessmentResult.getDamagePoints()) {
                ClaimDamagePoint point = ClaimDamagePoint.builder()
                        .claim(claim)
                        .area(dto.getArea() != null ? dto.getArea() : "General Body")
                        .severity(dto.getSeverity() != null ? dto.getSeverity() : "Medium")
                        .description(dto.getDescription() != null ? dto.getDescription() : "Damage point identified")
                        .build();
                newPoints.add(point);
            }
            claim.getDamagePoints().addAll(newPoints);
        }

        Claim savedClaim = claimRepository.save(claim);

        // Record Audit log
        auditLogService.record(
                currentUser,
                AuditAction.CREATE,
                "Claim",
                savedClaim.getId().toString(),
                "127.0.0.1"
        );

        return claimMapper.toResponse(savedClaim);
    }

    private void verifyOwnershipOrAdmin(Claim claim, User currentUser) {
        if (currentUser == null) {
            throw new ForbiddenException("Unauthenticated user cannot assess claims");
        }
        boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;
        boolean isOwner = claim != null &&
                claim.getPolicy() != null &&
                claim.getPolicy().getUser() != null &&
                currentUser.getId() != null &&
                currentUser.getId().equals(claim.getPolicy().getUser().getId());
        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("You do not have permission to access or assess this claim");
        }
    }
}
