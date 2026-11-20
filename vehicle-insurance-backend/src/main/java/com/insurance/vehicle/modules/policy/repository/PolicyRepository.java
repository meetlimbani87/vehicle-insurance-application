package com.insurance.vehicle.modules.policy.repository;

import com.insurance.vehicle.modules.policy.entity.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PolicyRepository extends JpaRepository<Policy, UUID> {

    // Backs the "policy number already exists" duplicate check on create
    boolean existsByPolicyNumberIgnoreCase(String policyNumber);

    // Powers GET /policies - every policy belonging to the logged-in user, newest first
    List<Policy> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

    // Powers GET /policies/{id} - scoped to the owner so one user can't fetch
    // another user's policy by guessing its id
    Optional<Policy> findByIdAndUserId(UUID id, UUID userId);

    // Backs the admin Users page's "Policies" count column
    long countByUserId(UUID userId);

    // Backs the admin Dashboard's "Premium Collected" KPI - total across every policy in the system
    @Query("SELECT COALESCE(SUM(p.premiumAmount), 0) FROM Policy p")
    long sumAllPremiums();
}
