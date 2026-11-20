package com.insurance.vehicle.modules.analytics.service;

import com.insurance.vehicle.modules.analytics.dto.AnalyticsSummaryResponse;
import com.insurance.vehicle.modules.analytics.dto.AnalyticsSummaryResponse.*;
import com.insurance.vehicle.modules.claim.entity.Claim;
import com.insurance.vehicle.modules.claim.entity.ClaimTimelineEvent;
import com.insurance.vehicle.modules.claim.repository.ClaimRepository;
import com.insurance.vehicle.modules.claim.repository.ClaimTimelineRepository;
import com.insurance.vehicle.modules.policy.entity.Policy;
import com.insurance.vehicle.modules.policy.entity.Vehicle;
import com.insurance.vehicle.modules.policy.repository.PolicyRepository;
import com.insurance.vehicle.modules.policy.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Year;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// Data for the four analytics charts. Read-only aggregates over
// Policy, Claim, Vehicle and ClaimTimelineEvent.
@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private static final String[] MONTH_LABELS = {
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    };

    private final PolicyRepository policyRepository;
    private final ClaimRepository claimRepository;
    private final VehicleRepository vehicleRepository;
    private final ClaimTimelineRepository claimTimelineRepository;

    public AnalyticsServiceImpl(
            PolicyRepository policyRepository,
            ClaimRepository claimRepository,
            VehicleRepository vehicleRepository,
            ClaimTimelineRepository claimTimelineRepository
    ) {
        this.policyRepository = policyRepository;
        this.claimRepository = claimRepository;
        this.vehicleRepository = vehicleRepository;
        this.claimTimelineRepository = claimTimelineRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse getSummary() {
        List<Claim> allClaims = claimRepository.findAll();

        return new AnalyticsSummaryResponse(
                claimsByMonth(allClaims),
                policyStatusBreakdown(),
                vehicleCategories(),
                avgSettlementTimeByMonth(allClaims)
        );
    }

    // All 12 months of the current year, Jan-Dec, zero-filled where there were no claims
    private List<MonthlyCount> claimsByMonth(List<Claim> allClaims) {
        int currentYear = Year.now().getValue();
        Map<Integer, Long> counts = allClaims.stream()
                .map(Claim::getFiledDate)
                .filter(date -> date.getYear() == currentYear)
                .collect(Collectors.groupingBy(LocalDate::getMonthValue, Collectors.counting()));

        List<MonthlyCount> result = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            result.add(new MonthlyCount(MONTH_LABELS[month - 1], counts.getOrDefault(month, 0L).intValue()));
        }
        return result;
    }

    // Every policy, grouped by its current status
    private List<StatusCount> policyStatusBreakdown() {
        Map<String, Long> counts = policyRepository.findAll().stream()
                .collect(Collectors.groupingBy(p -> p.getStatus().toDisplayValue(), LinkedHashMap::new, Collectors.counting()));

        return counts.entrySet().stream()
                .map(e -> new StatusCount(e.getKey(), e.getValue().intValue()))
                .toList();
    }

    // Every registered vehicle, grouped by type (Title-Case for display)
    private List<CategoryCount> vehicleCategories() {
        Map<String, Long> counts = vehicleRepository.findAll().stream()
                .collect(Collectors.groupingBy(Vehicle::getVehicleType, LinkedHashMap::new, Collectors.counting()));

        return counts.entrySet().stream()
                .map(e -> new CategoryCount(displayLabel(e.getKey()), e.getValue().intValue()))
                .toList();
    }

    // Average number of days between a claim being Filed and being Closed,
    // grouped by the month it was closed in. Uses the real ClaimTimelineEvent
    // history (not just current status) since that's the only place both
    // timestamps actually live.
    private List<MonthlyDays> avgSettlementTimeByMonth(List<Claim> allClaims) {
        Map<Integer, List<Long>> durationsByMonth = new LinkedHashMap<>();

        for (Claim claim : allClaims) {
            if (!"Closed".equals(claim.getStatus())) {
                continue;
            }
            List<ClaimTimelineEvent> timeline = claimTimelineRepository.findAllByClaim_IdOrderByCreatedAtAsc(claim.getId());

            LocalDate filedDate = timeline.stream()
                    .filter(e -> "Filed".equals(e.getStatus()))
                    .map(e -> e.getCreatedAt().toLocalDate())
                    .findFirst()
                    .orElse(claim.getFiledDate());

            LocalDate closedDate = timeline.stream()
                    .filter(e -> "Closed".equals(e.getStatus()))
                    .map(e -> e.getCreatedAt().toLocalDate())
                    .reduce((first, second) -> second) // last "Closed" event, in case of re-opens
                    .orElse(null);

            if (closedDate == null) {
                continue;
            }

            long days = ChronoUnit.DAYS.between(filedDate, closedDate);
            durationsByMonth.computeIfAbsent(closedDate.getMonthValue(), k -> new ArrayList<>()).add(days);
        }

        List<MonthlyDays> result = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            List<Long> durations = durationsByMonth.getOrDefault(month, List.of());
            int avg = durations.isEmpty() ? 0 : (int) Math.round(durations.stream().mapToLong(Long::longValue).average().orElse(0));
            result.add(new MonthlyDays(MONTH_LABELS[month - 1], avg));
        }
        return result;
    }

    private String displayLabel(String vehicleType) {
        return switch (vehicleType) {
            case "two-wheeler" -> "Two Wheeler";
            case "suv" -> "SUV";
            case "commercial" -> "Commercial";
            case "car" -> "Car";
            default -> vehicleType;
        };
    }
}
