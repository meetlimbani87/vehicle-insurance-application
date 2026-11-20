package com.insurance.vehicle.modules.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Matches the four charts on AnalyticsPage.tsx field for field.
 * One combined response since the page loads everything at once.
 * with charts that genuinely need to load independently.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummaryResponse {
    private List<MonthlyCount> claimsByMonth;
    private List<StatusCount> policyStatusBreakdown;
    private List<CategoryCount> vehicleCategories;
    private List<MonthlyDays> avgSettlementTime;

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class MonthlyCount {
        private String month;
        private int count;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class StatusCount {
        private String status;
        private int count;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CategoryCount {
        private String type;
        private int count;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class MonthlyDays {
        private String month;
        private int days;
    }
}
