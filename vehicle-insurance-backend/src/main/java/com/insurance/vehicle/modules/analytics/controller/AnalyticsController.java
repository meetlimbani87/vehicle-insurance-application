package com.insurance.vehicle.modules.analytics.controller;

import com.insurance.vehicle.modules.analytics.dto.AnalyticsSummaryResponse;
import com.insurance.vehicle.modules.analytics.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Admin-only - see SecurityConfig's .hasRole("ADMIN") on /admin/**
@RestController
@RequestMapping("/admin/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    // GET /api/admin/analytics/summary - real aggregates for the four Analytics page charts
    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryResponse> getSummary() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }
}
