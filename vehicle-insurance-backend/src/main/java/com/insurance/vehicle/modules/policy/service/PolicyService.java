package com.insurance.vehicle.modules.policy.service;

import com.insurance.vehicle.modules.policy.dto.PolicyCreateRequest;
import com.insurance.vehicle.modules.policy.dto.PolicyResponse;
import com.insurance.vehicle.modules.user.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface PolicyService {

    // Every policy owned by the given user, newest first (Dashboard, Applications, Claim-create pages)
    List<PolicyResponse> getPoliciesForUser(UUID userId);

    // A single policy, scoped to its owner so one user can't fetch another's by id (Policy detail page)
    PolicyResponse getPolicyById(UUID id, UUID userId);

    // Creates a new policy (and its vehicle, if not already registered) for the given user
    PolicyResponse createPolicy(User owner, PolicyCreateRequest request, String ipAddress);

    // Uploads one or more supporting documents (RC, PUC, previous policy) for an owned policy
    PolicyResponse uploadDocuments(UUID id, User currentUser, List<MultipartFile> files);
}
