package com.insurance.vehicle.modules.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExtractedVehicleDto {
    private String registrationNo;
    private String make;
    private String model;
    private Integer year;
    private String vehicleType;
}
