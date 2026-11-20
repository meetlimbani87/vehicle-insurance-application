package com.insurance.vehicle.modules.ai.service;

import com.insurance.vehicle.modules.claim.dto.ClaimResponse;
import com.insurance.vehicle.modules.user.entity.User;

import java.util.UUID;

public interface ClaimAiAssessmentService {

    /**
     * Evaluates a claim's coverage eligibility, estimates damage costs, identifies damage points,
     * and saves assessment data directly into Postgres on the Claim entity.
     */
    ClaimResponse assessClaim(UUID claimId, User currentUser);
}
