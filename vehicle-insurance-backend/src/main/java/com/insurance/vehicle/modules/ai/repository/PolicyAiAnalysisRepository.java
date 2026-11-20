package com.insurance.vehicle.modules.ai.repository;

import com.insurance.vehicle.modules.ai.entity.PolicyAiAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PolicyAiAnalysisRepository extends JpaRepository<PolicyAiAnalysis, UUID> {

    Optional<PolicyAiAnalysis> findFirstByPolicyIdOrderByCreatedAtDesc(UUID policyId);
}
