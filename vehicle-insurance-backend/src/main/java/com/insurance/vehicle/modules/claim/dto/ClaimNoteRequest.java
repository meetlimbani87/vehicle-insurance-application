package com.insurance.vehicle.modules.claim.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

// Body of POST /api/claims/{id}/notes
@Data
public class ClaimNoteRequest {

    @NotBlank(message = "Note cannot be empty")
    private String note;
}
