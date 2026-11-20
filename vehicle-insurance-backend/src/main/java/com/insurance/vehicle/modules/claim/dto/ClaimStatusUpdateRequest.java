package com.insurance.vehicle.modules.claim.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

// Body of PATCH /api/claims/{id}/status - admin-only action (Approve/Reject)
@Data
public class ClaimStatusUpdateRequest {

    @Pattern(regexp = "^(Under Review|Approved|Rejected|Closed)$", message = "Invalid status")
    private String status;
}
