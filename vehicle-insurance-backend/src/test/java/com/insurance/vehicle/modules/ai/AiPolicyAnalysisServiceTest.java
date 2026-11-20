package com.insurance.vehicle.modules.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurance.vehicle.common.enums.UserRole;
import com.insurance.vehicle.common.exception.BadRequestException;
import com.insurance.vehicle.common.exception.ForbiddenException;
import com.insurance.vehicle.modules.ai.dto.*;
import com.insurance.vehicle.modules.ai.entity.PolicyAiAnalysis;
import com.insurance.vehicle.modules.ai.mapper.PolicyAiAnalysisMapper;
import com.insurance.vehicle.modules.ai.repository.PolicyAiAnalysisRepository;
import com.insurance.vehicle.modules.ai.service.AiProviderClient;
import com.insurance.vehicle.modules.ai.service.AiPolicyAnalysisServiceImpl;
import com.insurance.vehicle.modules.ai.service.DocumentTextExtractor;
import com.insurance.vehicle.modules.audit.service.AuditLogService;
import com.insurance.vehicle.modules.policy.entity.Policy;
import com.insurance.vehicle.modules.policy.entity.Vehicle;
import com.insurance.vehicle.modules.policy.repository.PolicyRepository;
import com.insurance.vehicle.modules.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiPolicyAnalysisServiceTest {

    @Mock
    private PolicyRepository policyRepository;

    @Mock
    private PolicyAiAnalysisRepository analysisRepository;

    @Mock
    private DocumentTextExtractor documentTextExtractor;

    @Mock
    private AiProviderClient aiProviderClient;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @Spy
    private PolicyAiAnalysisMapper mapper = new PolicyAiAnalysisMapper(objectMapper);

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AiPolicyAnalysisServiceImpl service;

    private User owner;
    private User otherUser;
    private Policy policy;

    @BeforeEach
    void setUp() {
        owner = User.builder()
                .id(UUID.randomUUID())
                .email("owner@test.com")
                .role(UserRole.USER)
                .build();

        otherUser = User.builder()
                .id(UUID.randomUUID())
                .email("other@test.com")
                .role(UserRole.USER)
                .build();

        Vehicle vehicle = Vehicle.builder()
                .id(UUID.randomUUID())
                .make("Honda")
                .model("Civic")
                .year("2022")
                .registrationNo("MH01AB1234")
                .build();

        policy = Policy.builder()
                .id(UUID.randomUUID())
                .user(owner)
                .vehicle(vehicle)
                .policyNumber("POL-1001")
                .insuranceCompany("HDFC ERGO")
                .coverageType("Comprehensive")
                .startDate(LocalDate.of(2026, 1, 1))
                .endDate(LocalDate.of(2027, 1, 1))
                .premiumAmount(15000)
                .documents(new ArrayList<>(List.of("/uploads/policies/doc1.pdf")))
                .build();
    }

    @Test
    void analyzePolicyDocument_Success_StoresAnalysisAndDetectsConflicts() {
        when(policyRepository.findById(policy.getId())).thenReturn(Optional.of(policy));
        when(documentTextExtractor.extractText(anyString())).thenReturn("Sample document text");

        PolicyExtractionResult extraction = PolicyExtractionResult.builder()
                .policyNumber("POL-1001")
                .insuranceCompany("HDFC ERGO")
                .vehicle(ExtractedVehicleDto.builder().registrationNo("MH01AB1234").make("Honda").model("Civic").build())
                .coverage(ExtractedCoverageDto.builder().startDate("2026-01-05").endDate("2027-01-01").build()) // Discrepancy in start date
                .payment(ExtractedPaymentDto.builder().totalPremium("15000").build())
                .includedCoverage(List.of("Zero Depreciation"))
                .exclusions(List.of("Drunk driving"))
                .confidence(0.9)
                .build();

        when(aiProviderClient.extractPolicyInformation(anyString())).thenReturn(extraction);
        when(aiProviderClient.getProviderName()).thenReturn("test-ai-provider");

        when(analysisRepository.save(any(PolicyAiAnalysis.class))).thenAnswer(inv -> {
            PolicyAiAnalysis a = inv.getArgument(0);
            a.setId(UUID.randomUUID());
            return a;
        });

        PolicyAiAnalysisResponse response = service.analyzePolicyDocument(policy.getId(), owner, null);

        assertNotNull(response);
        assertEquals("COMPLETED", response.getStatus());
        assertEquals("test-ai-provider", response.getModelProvider());
        assertNotNull(response.getExtractionResult());
        assertEquals("POL-1001", response.getExtractionResult().getPolicyNumber());

        // Verify conflict detection (start date: DB 2026-01-01 vs extracted 2026-01-05)
        assertEquals(1, response.getConflicts().size());
        assertEquals("startDate", response.getConflicts().get(0).getField());
        assertEquals("2026-01-01", response.getConflicts().get(0).getExistingValue());
        assertEquals("2026-01-05", response.getConflicts().get(0).getExtractedValue());

        verify(auditLogService).record(eq(owner), any(), eq("PolicyAiAnalysis"), anyString(), any());
    }

    @Test
    void analyzePolicyDocument_ForbiddenForOtherUser() {
        when(policyRepository.findById(policy.getId())).thenReturn(Optional.of(policy));

        assertThrows(ForbiddenException.class, () ->
                service.analyzePolicyDocument(policy.getId(), otherUser, null)
        );
    }

    @Test
    void analyzePolicyDocument_ThrowsBadRequest_WhenNoDocumentExists() {
        policy.setDocuments(new ArrayList<>());
        when(policyRepository.findById(policy.getId())).thenReturn(Optional.of(policy));

        assertThrows(BadRequestException.class, () ->
                service.analyzePolicyDocument(policy.getId(), owner, null)
        );
    }

    @Test
    void getLatestAnalysis_Success() {
        when(policyRepository.findById(policy.getId())).thenReturn(Optional.of(policy));

        PolicyAiAnalysis existingAnalysis = PolicyAiAnalysis.builder()
                .id(UUID.randomUUID())
                .policy(policy)
                .status("COMPLETED")
                .policyNumberExtracted("POL-1001")
                .confidence(0.95)
                .build();

        when(analysisRepository.findFirstByPolicyIdOrderByCreatedAtDesc(policy.getId()))
                .thenReturn(Optional.of(existingAnalysis));

        PolicyAiAnalysisResponse response = service.getLatestAnalysis(policy.getId(), owner);

        assertNotNull(response);
        assertEquals("COMPLETED", response.getStatus());
        assertEquals("POL-1001", response.getExtractionResult().getPolicyNumber());
    }

    @Test
    void analyzePolicyDocument_ProviderFailure_FailsSafelyWithoutCorruptingPolicy() {
        when(policyRepository.findById(policy.getId())).thenReturn(Optional.of(policy));
        when(documentTextExtractor.extractText(anyString())).thenThrow(new RuntimeException("Storage failure"));
        when(aiProviderClient.getProviderName()).thenReturn("test-provider");

        when(analysisRepository.save(any(PolicyAiAnalysis.class))).thenAnswer(inv -> {
            PolicyAiAnalysis a = inv.getArgument(0);
            a.setId(UUID.randomUUID());
            return a;
        });

        PolicyAiAnalysisResponse response = service.analyzePolicyDocument(policy.getId(), owner, null);

        assertNotNull(response);
        assertEquals("FAILED", response.getStatus());
        assertTrue(response.getErrorMessage().contains("Storage failure"));
    }
}
