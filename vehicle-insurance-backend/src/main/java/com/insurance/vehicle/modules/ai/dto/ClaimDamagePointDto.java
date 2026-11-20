package com.insurance.vehicle.modules.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimDamagePointDto {
    private String area;
    private String severity; // "Low" | "Medium" | "High" | "Critical"
    private String description;
    private Integer estimatedRepairCost;
    private Boolean isCovered;
}
