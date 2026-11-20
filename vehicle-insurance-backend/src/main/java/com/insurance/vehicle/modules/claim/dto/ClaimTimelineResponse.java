package com.insurance.vehicle.modules.claim.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// One entry in GET /api/claims/{id}/timeline's response list
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimTimelineResponse {
    private String status;
    private String note;
    private String timestamp;
}
