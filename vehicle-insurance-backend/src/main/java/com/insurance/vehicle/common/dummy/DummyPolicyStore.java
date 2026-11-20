package com.insurance.vehicle.common.dummy;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Shared in-memory "table" of policies, seeded to match the frontend's
 * mockPolicies.ts exactly. TEMPORARY: replaced by a real PolicyRepository +
 * Postgres once we move past the dummy-data phase.
 */
@Component
public class DummyPolicyStore {

    private final List<PolicyRecord> policies = new CopyOnWriteArrayList<>();
    private final AtomicInteger idSeq = new AtomicInteger(6); // next id after seed data (p1..p5)

    // Constructor: seeds the in-memory list with all 5 demo policies on app startup
    public DummyPolicyStore() {
        policies.add(new PolicyRecord("p1", "POL-2024-001", "Maruti", "Swift", "2021", "GJ01AB1234",
                "car", "HDFC Ergo", "comprehensive", "2024-01-01", "2025-06-01", "Active", 12500, "Rahul Sharma", null));
        policies.add(new PolicyRecord("p2", "POL-2024-002", "Honda", "City", "2020", "MH02CD5678",
                "car", "ICICI Lombard", "third-party", "2023-06-15", "2024-06-15", "Expired", 8900, "Rahul Sharma", null));
        policies.add(new PolicyRecord("p3", "POL-2024-003", "Royal Enfield", "Classic 350", "2022", "DL03EF9012",
                "two-wheeler", "Bajaj Allianz", "comprehensive", "2024-03-01", "2025-03-01", "Active", 4500, "Rahul Sharma", null));
        policies.add(new PolicyRecord("p4", "POL-2024-004", "Toyota", "Fortuner", "2023", "KA04GH3456",
                "suv", "New India Assurance", "comprehensive", "2024-02-01", "2025-02-01", "Renewed", 28000, "Rahul Sharma", null));
        policies.add(new PolicyRecord("p5", "POL-2024-005", "Tata", "Ace", "2019", "TN05IJ7890",
                "commercial", "United India", "own-damage", "2024-01-15", "2024-07-15", "Cancelled", 15000, "Rahul Sharma", null));
    }

    // Returns every policy in the store — backs GET /policies
    public List<PolicyRecord> findAll() {
        return policies;
    }

    // Looks up one policy by its id — will back GET /policies/{id} (Policy Detail page)
    public Optional<PolicyRecord> findById(String id) {
        return policies.stream().filter(p -> p.getId().equals(id)).findFirst();
    }

    // Adds a new policy (assigning it the next "pN" id if it doesn't have one) — will back policy creation
    public PolicyRecord save(PolicyRecord policy) {
        if (policy.getId() == null) {
            policy.setId("p" + idSeq.getAndIncrement());
        }
        policies.add(policy);
        return policy;
    }
}
