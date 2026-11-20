package com.insurance.vehicle.modules.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentHealthSummaryDto {
    private Integer totalPremiumsPaid;
    private Integer paidInstallmentsCount;
    private Integer totalInstallmentsCount;
    private String paymentStatusHealth; // "100% On-Time" | "Good Standing" | "Overdue" | "No Record"
    private Double claimToPremiumRatio;
}
