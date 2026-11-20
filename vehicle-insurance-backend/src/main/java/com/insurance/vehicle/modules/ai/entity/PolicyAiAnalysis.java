package com.insurance.vehicle.modules.ai.entity;

import com.insurance.vehicle.modules.policy.entity.Policy;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "policy_ai_analyses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PolicyAiAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "policy_id", nullable = false)
    private Policy policy;

    @Column(nullable = false, length = 50)
    private String status; // PENDING, PROCESSING, COMPLETED, FAILED

    @Column(name = "policy_number_extracted")
    private String policyNumberExtracted;

    @Column(name = "insurer_extracted")
    private String insurerExtracted;

    @Column(name = "policyholder_name_extracted")
    private String policyholderNameExtracted;

    @Column(name = "start_date_extracted", length = 50)
    private String startDateExtracted;

    @Column(name = "end_date_extracted", length = 50)
    private String endDateExtracted;

    @Column(name = "premium_extracted", length = 100)
    private String premiumExtracted;

    @Column(name = "payment_interval_extracted", length = 50)
    private String paymentIntervalExtracted;

    @Column(name = "idv_extracted", length = 100)
    private String idvExtracted;

    @Column(name = "deductible_extracted", length = 100)
    private String deductibleExtracted;

    private Double confidence;

    @Column(name = "raw_structured_result", columnDefinition = "TEXT")
    private String rawStructuredResult;

    @Column(columnDefinition = "TEXT")
    private String conflicts;

    @Column(name = "model_provider", length = 100)
    private String modelProvider;

    @Column(name = "analyzed_at")
    private OffsetDateTime analyzedAt;

    @Column(name = "source_document_url", length = 500)
    private String sourceDocumentUrl;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
