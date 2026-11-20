package com.insurance.vehicle.modules.analytics.service;

import com.insurance.vehicle.modules.analytics.dto.AnalyticsSummaryResponse;

public interface AnalyticsService {

    // Real aggregates for the admin Analytics page - admin only
    AnalyticsSummaryResponse getSummary();
}
