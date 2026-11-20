package com.insurance.vehicle.modules.claim.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

// Body of PATCH /api/claims/{id}/actual-amount - matches updateClaimAmountSchema
@Data
public class ClaimActualAmountRequest {

    @NotNull(message = "Enter a valid amount")
    @Positive(message = "Enter a valid amount")
    private Integer actualAmount;
}
