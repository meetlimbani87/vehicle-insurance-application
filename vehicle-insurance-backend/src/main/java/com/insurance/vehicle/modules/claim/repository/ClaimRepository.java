package com.insurance.vehicle.modules.claim.repository;

import com.insurance.vehicle.modules.claim.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClaimRepository extends JpaRepository<Claim, UUID> {

    // A normal user's own claims (via the policy they filed against), newest first
    List<Claim> findAllByPolicy_User_IdOrderByFiledDateDesc(UUID userId);

    // Every claim in the system, newest first - admin view only
    List<Claim> findAllByOrderByFiledDateDesc();

    // Ownership-scoped single lookup: a normal user can only fetch their own claim by id
    Optional<Claim> findByIdAndPolicy_User_Id(UUID id, UUID userId);

    // Backs the "claim number already exists" retry loop when generating a new one
    boolean existsByClaimNumberIgnoreCase(String claimNumber);

    // Backs the admin Users page's "Claims" count column
    long countByPolicy_User_Id(UUID userId);

    // Backs the admin Dashboard's "Claimed" KPI (Approved + Closed count)
    long countByStatusIn(List<String> statuses);
}
