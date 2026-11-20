package com.insurance.vehicle.modules.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisualDamagePointDto {
    private String area;
    private String severity; // "Low" | "Medium" | "High" | "Critical"
    private Integer visualConfidence; // 0 to 100
    private String description;
    private String detectedFromPhoto; // File name or photo reference
}
