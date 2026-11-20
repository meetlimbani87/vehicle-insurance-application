package com.insurance.vehicle.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// Shape matches AdminDashboardPage.tsx's KPI cards + Monthly Claims chart +
// Vehicle Distribution donut, all computed from real data instead of the
// page's previous hardcoded arrays.
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardSummaryResponse {
    private long totalPolicies;
    private long totalClaims;
    private long claimedCount;
    private long unclaimedCount;
    private long premiumCollected;
    private List<MonthlyClaimCount> monthlyClaims;
    private List<VehicleTypeCount> vehicleDistribution;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyClaimCount {
        private String month;
        private int count;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VehicleTypeCount {
        private String type;
        private int count;
    }
}
