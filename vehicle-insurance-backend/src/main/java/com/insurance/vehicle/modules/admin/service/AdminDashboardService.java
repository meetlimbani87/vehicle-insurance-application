package com.insurance.vehicle.modules.admin.service;

import com.insurance.vehicle.modules.admin.dto.AdminDashboardSummaryResponse;

public interface AdminDashboardService {

    // Real-time aggregate counts/sums across the whole system - admin only
    AdminDashboardSummaryResponse getSummary();
}
