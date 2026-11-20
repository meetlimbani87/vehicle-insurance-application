package com.insurance.vehicle.modules.claim.repository;

import com.insurance.vehicle.modules.claim.entity.ClaimTimelineEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ClaimTimelineRepository extends JpaRepository<ClaimTimelineEvent, Long> {

    // A claim's full history, oldest first - reconstructs the timeline in order
    List<ClaimTimelineEvent> findAllByClaim_IdOrderByCreatedAtAsc(UUID claimId);
}
