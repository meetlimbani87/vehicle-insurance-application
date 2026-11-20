package com.insurance.vehicle.common.dummy;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DamagePointRecord {
    private String area;
    private String severity; // "Low" | "Medium" | "High" | "Critical"
    private String description;
}
