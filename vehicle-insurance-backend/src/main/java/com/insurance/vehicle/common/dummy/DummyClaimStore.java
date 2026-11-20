package com.insurance.vehicle.common.dummy;

import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Shared in-memory "table" of claims, seeded to match the frontend's
 * mockClaims.ts exactly. TEMPORARY: replaced by a real ClaimRepository +
 * Postgres once we move past the dummy-data phase.
 */
@Component
public class DummyClaimStore {

    private final List<ClaimRecord> claims = new CopyOnWriteArrayList<>();
    private final AtomicInteger idSeq = new AtomicInteger(9); // next id after seed data (c1..c8)

    // Constructor: seeds the in-memory list with all 8 demo claims (including nested
    // damage-assessment data) on app startup
    public DummyClaimStore() {
        claims.add(new ClaimRecord(
                "c1", "CLM-2024-001", "p1", "POL-2024-001", "2024-06-15",
                "Ahmedabad, Gujarat - SG Highway near Iscon Temple",
                "Rear-end collision at traffic signal. The vehicle in front suddenly braked, causing damage to the front bumper and headlights.",
                "Approved", 45000, 42000, "2024-06-16", "Maruti", "Swift", "GJ01AB1234",
                new DamageAssessmentRecord(Arrays.asList(
                        new DamagePointRecord("Front Bumper", "High", "Cracked and displaced bumper"),
                        new DamagePointRecord("Left Headlight", "Medium", "Lens cracked, housing intact"),
                        new DamagePointRecord("Hood", "Low", "Minor dent on leading edge"),
                        new DamagePointRecord("Radiator Grille", "High", "Completely shattered")
                ), "Eligible", 92),
                Arrays.asList("Photos uploaded on 16th June", "Surveyor visit scheduled", "Assessment complete"),
                List.of()
        ));

        claims.add(new ClaimRecord(
                "c2", "CLM-2024-002", "p1", "POL-2024-001", "2024-08-20",
                "Mumbai, Maharashtra - Western Express Highway",
                "Side swipe damage while changing lanes on the highway during heavy rain. Right side doors and mirror damaged significantly.",
                "Under Review", 68000, null, "2024-08-21", "Maruti", "Swift", "GJ01AB1234",
                new DamageAssessmentRecord(Arrays.asList(
                        new DamagePointRecord("Right Front Door", "High", "Deep scratch and dent"),
                        new DamagePointRecord("Right Rear Door", "Medium", "Surface scratches"),
                        new DamagePointRecord("Right Mirror", "Critical", "Completely broken off")
                ), "Eligible", 88),
                List.of("Awaiting surveyor report"),
                List.of()
        ));

        claims.add(new ClaimRecord(
                "c3", "CLM-2024-003", "p3", "POL-2024-003", "2024-07-10",
                "Delhi, Connaught Place",
                "Bike slipped on wet road and skidded. Damage to handlebar, left side panel, and exhaust pipe.",
                "Filed", null, null, "2024-07-11", "Royal Enfield", "Classic 350", "DL03EF9012",
                null,
                List.of("Claim filed, awaiting initial review"),
                List.of()
        ));

        claims.add(new ClaimRecord(
                "c4", "CLM-2024-004", "p4", "POL-2024-004", "2024-05-22",
                "Bangalore, Electronic City",
                "Tree fell on the parked vehicle during a storm causing extensive roof and windshield damage.",
                "Approved", 125000, 118000, "2024-05-23", "Toyota", "Fortuner", "KA04GH3456",
                new DamageAssessmentRecord(Arrays.asList(
                        new DamagePointRecord("Roof", "Critical", "Severely dented and deformed"),
                        new DamagePointRecord("Windshield", "Critical", "Completely shattered"),
                        new DamagePointRecord("Front Pillars", "High", "Bent and cracked paint"),
                        new DamagePointRecord("Hood", "Medium", "Multiple dents from debris")
                ), "Eligible", 95),
                Arrays.asList("Surveyor visited", "Assessment uploaded", "Approved by underwriter"),
                List.of()
        ));

        claims.add(new ClaimRecord(
                "c5", "CLM-2024-005", "p2", "POL-2024-002", "2024-04-10",
                "Pune, Hinjewadi",
                "Minor fender bender in office parking lot. Low speed impact to rear bumper.",
                "Rejected", 8000, null, "2024-04-11", "Honda", "City", "MH02CD5678",
                new DamageAssessmentRecord(List.of(
                        new DamagePointRecord("Rear Bumper", "Low", "Minor scratch")
                ), "Not Eligible", 78),
                List.of("Claim rejected: Policy is third-party only, own damage not covered"),
                List.of()
        ));

        claims.add(new ClaimRecord(
                "c6", "CLM-2024-006", "p4", "POL-2024-004", "2024-09-01",
                "Chennai, Anna Salai",
                "Flood water entered the vehicle engine bay during heavy rains. Engine hydrolock suspected.",
                "Under Review", 250000, null, "2024-09-02", "Toyota", "Fortuner", "KA04GH3456",
                new DamageAssessmentRecord(Arrays.asList(
                        new DamagePointRecord("Engine", "Critical", "Possible hydrolock damage"),
                        new DamagePointRecord("ECU", "High", "Water ingress detected"),
                        new DamagePointRecord("Interior", "Medium", "Water stains on seats and carpet")
                ), "Partially Eligible", 72),
                List.of("Awaiting engine inspection report"),
                List.of()
        ));

        claims.add(new ClaimRecord(
                "c7", "CLM-2024-007", "p1", "POL-2024-001", "2024-03-15",
                "Surat, Ring Road",
                "Hit a pothole at high speed causing suspension damage and tyre blowout on the left side.",
                "Closed", 22000, 19500, "2024-03-16", "Maruti", "Swift", "GJ01AB1234",
                new DamageAssessmentRecord(Arrays.asList(
                        new DamagePointRecord("Left Front Suspension", "High", "Strut damaged"),
                        new DamagePointRecord("Left Front Tyre", "Critical", "Blown out completely"),
                        new DamagePointRecord("Wheel Rim", "Medium", "Bent rim")
                ), "Eligible", 90),
                Arrays.asList("Claim settled", "Payment processed"),
                List.of()
        ));

        claims.add(new ClaimRecord(
                "c8", "CLM-2024-008", "p3", "POL-2024-003", "2024-10-05",
                "Jaipur, MI Road",
                "Collision with a stray animal. Front fork bent, headlight broken and tank dented.",
                "Filed", null, null, "2024-10-06", "Royal Enfield", "Classic 350", "DL03EF9012",
                null,
                List.of("Claim registered, pending photo upload"),
                List.of()
        ));
    }

    // Returns every claim in the store — backs GET /claims
    public List<ClaimRecord> findAll() {
        return claims;
    }

    // Looks up one claim by its id — will back GET /claims/{id} (Claim Detail page)
    public Optional<ClaimRecord> findById(String id) {
        return claims.stream().filter(c -> c.getId().equals(id)).findFirst();
    }

    // Adds a new claim (assigning it the next "cN" id if it doesn't have one) — will back claim filing
    public ClaimRecord save(ClaimRecord claim) {
        if (claim.getId() == null) {
            claim.setId("c" + idSeq.getAndIncrement());
        }
        claims.add(claim);
        return claim;
    }
}
