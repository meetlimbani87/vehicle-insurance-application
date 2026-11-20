package com.insurance.vehicle.modules.policy.mapper;

import com.insurance.vehicle.modules.policy.dto.PolicyResponse;
import com.insurance.vehicle.modules.policy.entity.Policy;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

/**
 * Assembles the flat PolicyResponse the frontend expects (src/mock/mockPolicies.ts
 * Policy interface) out of the normalized Policy -> Vehicle/User entity graph.
 */
@Component
public class PolicyMapper {

    // Flattens a Policy (plus its linked Vehicle and owning User) into the
    // single flat DTO shape the frontend's Policy type expects
    public PolicyResponse toResponse(Policy policy) {
        return new PolicyResponse(
                policy.getId().toString(),
                policy.getPolicyNumber(),
                policy.getVehicle().getMake(),
                policy.getVehicle().getModel(),
                policy.getVehicle().getYear(),
                policy.getVehicle().getRegistrationNo(),
                policy.getVehicle().getVehicleType(),
                policy.getInsuranceCompany(),
                policy.getCoverageType(),
                policy.getStartDate().toString(),
                policy.getEndDate().toString(),
                policy.getStatus().toDisplayValue(),
                policy.getPremiumAmount(),
                policy.getUser().getName(),
                policy.getNotes(),
                // Wrapped in a real ArrayList so it's a genuine in-memory copy,
                // not a live Hibernate lazy-collection proxy. Just calling
                // getDocuments() doesn't force it to load - merely holding the
                // reference and handing it to Jackson later (after the request's
                // transaction/session has already closed) is exactly what threw
                // LazyInitializationException here. @Transactional alone doesn't
                // fix this for collections: it keeps the session open long enough
                // to load them IF something actually touches their contents
                // in-transaction, which `new ArrayList<>(...)` does right here.
                new ArrayList<>(policy.getDocuments())
        );
    }
}
