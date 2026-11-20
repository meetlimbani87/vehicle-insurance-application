package com.insurance.vehicle.modules.admin.service;

import com.insurance.vehicle.modules.admin.dto.AdminDashboardSummaryResponse;
import com.insurance.vehicle.modules.admin.dto.AdminDashboardSummaryResponse.MonthlyClaimCount;
import com.insurance.vehicle.modules.admin.dto.AdminDashboardSummaryResponse.VehicleTypeCount;
import com.insurance.vehicle.modules.claim.entity.Claim;
import com.insurance.vehicle.modules.claim.repository.ClaimRepository;
import com.insurance.vehicle.modules.policy.entity.Vehicle;
import com.insurance.vehicle.modules.policy.repository.PolicyRepository;
import com.insurance.vehicle.modules.policy.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// Dashboard numbers. All read-only counts/sums over Policy, Claim and Vehicle,
// nothing new to store.
@Service
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private static final List<String> CLAIMED_STATUSES = List.of("Approved", "Closed");
    private static final String[] MONTH_LABELS = {
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    };

    private final PolicyRepository policyRepository;
    private final ClaimRepository claimRepository;
    private final VehicleRepository vehicleRepository;

    public AdminDashboardServiceImpl(PolicyRepository policyRepository, ClaimRepository claimRepository, VehicleRepository vehicleRepository) {
        this.policyRepository = policyRepository;
        this.claimRepository = claimRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardSummaryResponse getSummary() {
        long totalPolicies = policyRepository.count();
        long totalClaims = claimRepository.count();
        long claimedCount = claimRepository.countByStatusIn(CLAIMED_STATUSES);
        long unclaimedCount = totalClaims - claimedCount;
        long premiumCollected = policyRepository.sumAllPremiums();

        return new AdminDashboardSummaryResponse(
                totalPolicies,
                totalClaims,
                claimedCount,
                unclaimedCount,
                premiumCollected,
                monthlyClaimsForCurrentYear(),
                vehicleDistribution()
        );
    }

    // All 12 months of the current calendar year, Jan through Dec, months
    // with no claims still included as a zero - matches the frontend chart's
    // original fixed 12-bar layout rather than a rolling "last N months" window
    private List<MonthlyClaimCount> monthlyClaimsForCurrentYear() {
        int currentYear = Year.now().getValue();
        Map<Integer, Long> countsByMonth = claimRepository.findAll().stream()
                .map(Claim::getFiledDate)
                .filter(date -> date.getYear() == currentYear)
                .collect(Collectors.groupingBy(java.time.LocalDate::getMonthValue, Collectors.counting()));

        List<MonthlyClaimCount> result = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            result.add(new MonthlyClaimCount(MONTH_LABELS[month - 1], countsByMonth.getOrDefault(month, 0L).intValue()));
        }
        return result;
    }

    // Every registered vehicle, grouped by type, with the frontend's Title-Case
    // display labels (stored value is the plain "two-wheeler" style string)
    private List<VehicleTypeCount> vehicleDistribution() {
        Map<String, Long> countsByType = vehicleRepository.findAll().stream()
                .collect(Collectors.groupingBy(Vehicle::getVehicleType, LinkedHashMap::new, Collectors.counting()));

        return countsByType.entrySet().stream()
                .map(entry -> new VehicleTypeCount(displayLabel(entry.getKey()), entry.getValue().intValue()))
                .toList();
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
