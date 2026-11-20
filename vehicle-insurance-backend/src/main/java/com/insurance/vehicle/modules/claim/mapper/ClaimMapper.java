package com.insurance.vehicle.modules.claim.mapper;

import com.insurance.vehicle.modules.claim.dto.ClaimResponse;
import com.insurance.vehicle.modules.claim.entity.Claim;
import com.insurance.vehicle.modules.claim.entity.ClaimDamagePoint;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ClaimMapper {

    public ClaimResponse toResponse(Claim claim) {
        List<ClaimResponse.DamagePoint> points = (claim.getDamagePoints() != null)
                ? claim.getDamagePoints().stream().map(this::toDamagePoint).toList()
                : new ArrayList<>();

        int confidence = claim.getAiConfidence() != null ? claim.getAiConfidence() : 0;
        
        ClaimResponse.DamageAssessment assessment = claim.getDamageEligibility() != null
                ? new ClaimResponse.DamageAssessment(points, claim.getDamageEligibility(), confidence)
                : null;

        return new ClaimResponse(
                claim.getId().toString(),
                claim.getClaimNumber(),
                claim.getPolicy().getId().toString(),
                claim.getPolicy().getPolicyNumber(),
                claim.getAccidentDate().toString(),
                claim.getLocation(),
                claim.getDescription(),
                claim.getStatus(),
                claim.getEstimatedAmount(),
                claim.getActualAmount(),
                claim.getFiledDate().toString(),
                claim.getVehicleMake(),
                claim.getVehicleModel(),
                claim.getRegistrationNo(),
                claim.getDamageEligibility(),
                claim.getAiConfidence(),
                points,
                assessment,
                new ArrayList<>(claim.getNotes()),
                new ArrayList<>(claim.getPhotos()),
                new ArrayList<>(claim.getDocuments())
        );
    }

    private ClaimResponse.DamagePoint toDamagePoint(ClaimDamagePoint point) {
        return new ClaimResponse.DamagePoint(point.getArea(), point.getSeverity(), point.getDescription());
    }
}
