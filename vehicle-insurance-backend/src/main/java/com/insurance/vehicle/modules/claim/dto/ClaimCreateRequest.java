package com.insurance.vehicle.modules.claim.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Body of POST /api/claims. Matches the frontend's CreateClaimInput
 * (src/schemas/claimSchemas.ts) field-for-field - photos/documents are
 * uploaded separately (see /claims/{id}/photos, /claims/{id}/documents)
 * once the claim itself exists and has an id to attach them to.
 */
@Data
public class ClaimCreateRequest {

    @NotBlank(message = "Select a policy")
    private String policyId;

    @NotBlank(message = "Date is required")
    private String accidentDate;

    @Size(min = 3, message = "Location is required")
    private String location;

    @Size(min = 20, message = "Describe the incident in at least 20 characters")
    private String description;
}
