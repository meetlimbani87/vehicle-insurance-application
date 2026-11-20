package com.insurance.vehicle.modules.policy.service;

import org.springframework.stereotype.Service;

import java.time.Year;

/**
 * Deterministic, rule-based premium calculator - NOT AI-driven. Intentionally
 * simple for this phase: a base rate per vehicle type, multiplied by a
 * coverage-type factor, with a flat surcharge added for every year of vehicle
 * age past 5 years (older vehicles cost more to insure).
 */
@Service
public class PremiumCalculatorService {

    // Base annual premium per vehicle type, in rupees
    private static final int BASE_TWO_WHEELER = 3000;
    private static final int BASE_CAR = 10000;
    private static final int BASE_SUV = 18000;
    private static final int BASE_COMMERCIAL = 14000;

    private static final int AGE_SURCHARGE_PER_YEAR = 300;
    private static final int AGE_THRESHOLD_YEARS = 5;

    // Computes the premium for a new policy from its vehicle type, coverage
    // type, and vehicle year. Called once at policy-creation time; the result
    // is stored on the Policy row rather than recalculated on every read.
    public int calculate(String vehicleType, String coverageType, String vehicleYear) {
        int base = baseRateFor(vehicleType);
        double coverageFactor = coverageFactorFor(coverageType);
        int ageSurcharge = ageSurcharge(vehicleYear);

        return (int) Math.round(base * coverageFactor) + ageSurcharge;
    }

    // Starting point before any multipliers/surcharges are applied
    private int baseRateFor(String vehicleType) {
        return switch (vehicleType) {
            case "two-wheeler" -> BASE_TWO_WHEELER;
            case "car" -> BASE_CAR;
            case "suv" -> BASE_SUV;
            case "commercial" -> BASE_COMMERCIAL;
            default -> BASE_CAR; // safe fallback; controller-level validation should prevent this
        };
    }

    // Comprehensive costs the most (covers own + third-party damage),
    // third-party the least (legally mandated minimum, narrowest cover)
    private double coverageFactorFor(String coverageType) {
        return switch (coverageType) {
            case "comprehensive" -> 1.5;
            case "own-damage" -> 1.2;
            case "third-party" -> 1.0;
            default -> 1.0;
        };
    }

    // Every year past the threshold adds a flat surcharge; never negative
    // for vehicles newer than the threshold
    private int ageSurcharge(String vehicleYear) {
        int currentYear = Year.now().getValue();
        int age = currentYear - Integer.parseInt(vehicleYear);
        int yearsOverThreshold = Math.max(0, age - AGE_THRESHOLD_YEARS);
        return yearsOverThreshold * AGE_SURCHARGE_PER_YEAR;
    }
}
