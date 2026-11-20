package com.insurance.vehicle.modules.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExtractedPaymentDto {
    private String totalPremium;
    private String paymentInterval;
    private String installmentAmount;
    private String nextPaymentDate;
}
