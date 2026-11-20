package com.insurance.vehicle.modules.ai;

import com.insurance.vehicle.common.exception.ForbiddenException;
import com.insurance.vehicle.common.exception.ResourceNotFoundException;
import com.insurance.vehicle.modules.ai.dto.ClaimAiAssessmentResult;
import com.insurance.vehicle.modules.ai.dto.ClaimDamagePointDto;
import com.insurance.vehicle.modules.ai.repository.PolicyAiAnalysisRepository;
import com.insurance.vehicle.modules.ai.service.ClaimAiAssessmentServiceImpl;
import com.insurance.vehicle.modules.ai.service.OpenAiClaimAssessmentClient;
import com.insurance.vehicle.modules.ai.service.OpenAiDamageVisionClient;
import com.insurance.vehicle.modules.audit.service.AuditLogService;
import com.insurance.vehicle.modules.claim.dto.ClaimResponse;
import com.insurance.vehicle.modules.claim.entity.Claim;
import com.insurance.vehicle.modules.claim.mapper.ClaimMapper;
import com.insurance.vehicle.modules.claim.repository.ClaimRepository;
import com.insurance.vehicle.modules.policy.entity.Policy;
import com.insurance.vehicle.modules.user.entity.User;
import com.insurance.vehicle.common.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClaimAiAssessmentServiceTest {

    @Mock   
    private ClaimRepository claimRepository;

    @Mock
    private PolicyAiAnalysisRepository policyAiAnalysisRepository;

    @Mock
    private com.insurance.vehicle.modules.payment.repository.PaymentScheduleRepository paymentScheduleRepository;

    @Mock
    private OpenAiClaimAssessmentClient openAiClaimAssessmentClient;

    @Mock
    private OpenAiDamageVisionClient openAiDamageVisionClient;

    @Mock
    private ClaimMapper claimMapper;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private ClaimAiAssessmentServiceImpl service;

    private User owner;
    private User otherUser;
    private Policy policy;
    private Claim claim;

    @BeforeEach
    void setUp() {
        UUID ownerId = UUID.randomUUID();
        owner = User.builder().id(ownerId).email("owner@test.com").role(UserRole.USER).build();
        otherUser = User.builder().id(UUID.randomUUID()).email("other@test.com").role(UserRole.USER).build();

        policy = Policy.builder()
                .id(UUID.randomUUID())
                .user(owner)
                .policyNumber("POL-100")
                .insuranceCompany("HDFC Ergo")
                .startDate(LocalDate.now().minusMonths(1))
                .endDate(LocalDate.now().plusMonths(11))
                .build();

        claim = Claim.builder()
                .id(UUID.randomUUID())
                .claimNumber("CLM-2026-001")
                .policy(policy)
                .accidentDate(LocalDate.now().minusDays(5))
                .filedDate(LocalDate.now().minusDays(2))
                .location("Mumbai")
                .description("Accident front bumper crack")
                .vehicleMake("Honda")
                .vehicleModel("City")
                .registrationNo("GJ01AB1234")
                .status("Filed")
                .damagePoints(new ArrayList<>())
                .build();
    }

    @Test
    void assessClaim_Success_UpdatesClaimAndSavesToPostgres() {
        when(claimRepository.findById(claim.getId())).thenReturn(Optional.of(claim));
        when(policyAiAnalysisRepository.findFirstByPolicyIdOrderByCreatedAtDesc(policy.getId())).thenReturn(Optional.empty());

        ClaimAiAssessmentResult result = ClaimAiAssessmentResult.builder()
                .eligibility("Eligible")
                .confidence(0.90)
                .estimatedAmount(15000)
                .reasoning("Coverage validated")
                .damagePoints(List.of(
                        ClaimDamagePointDto.builder().area("Front Bumper").severity("Medium").description("Bumper crack").build()
                ))
                .build();

        when(openAiClaimAssessmentClient.assessClaim(any(), any(), any())).thenReturn(result);
        when(openAiDamageVisionClient.analyzeDamagePhotos(any())).thenReturn(
                OpenAiDamageVisionClient.VisionAnalysisResponse.builder()
                        .photoConsistencyScore(95)
                        .visualDamagePoints(new ArrayList<>())
                        .build()
        );
        when(paymentScheduleRepository.findAllByPolicyId(any())).thenReturn(new ArrayList<>());
        when(claimRepository.save(any(Claim.class))).thenAnswer(i -> i.getArgument(0));
        when(claimMapper.toResponse(any(Claim.class))).thenReturn(new ClaimResponse());

        ClaimResponse response = service.assessClaim(claim.getId(), owner);

        assertNotNull(response);
        assertEquals("Eligible", claim.getDamageEligibility());
        assertEquals(98, claim.getAiConfidence());
        assertEquals(15000, claim.getEstimatedAmount());
        assertEquals(1, claim.getDamagePoints().size());

        verify(claimRepository).save(claim);
        verify(auditLogService).record(eq(owner), any(), eq("Claim"), eq(claim.getId().toString()), any());
    }

    @Test
    void assessClaim_ForbiddenUser_ThrowsForbiddenException() {
        when(claimRepository.findById(claim.getId())).thenReturn(Optional.of(claim));

        assertThrows(ForbiddenException.class, () -> service.assessClaim(claim.getId(), otherUser));
        verify(claimRepository, never()).save(any());
    }

    @Test
    void assessClaim_NotFound_ThrowsResourceNotFoundException() {
        UUID randomId = UUID.randomUUID();
        when(claimRepository.findById(randomId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.assessClaim(randomId, owner));
    }
}
