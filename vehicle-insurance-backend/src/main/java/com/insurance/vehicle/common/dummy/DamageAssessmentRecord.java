package com.insurance.vehicle.common.dummy;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DamageAssessmentRecord {
    private List<DamagePointRecord> points;
    private String eligibility; // "Eligible" | "Partially Eligible" | "Not Eligible"
    private int aiConfidence;
}
