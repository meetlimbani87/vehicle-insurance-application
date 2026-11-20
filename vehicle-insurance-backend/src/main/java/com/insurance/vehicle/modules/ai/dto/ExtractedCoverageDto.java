package com.insurance.vehicle.modules.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExtractedCoverageDto {
    private String startDate;
    private String endDate;
    private String coverageType;
    private String insuredDeclaredValue;
    private String deductible;
}
