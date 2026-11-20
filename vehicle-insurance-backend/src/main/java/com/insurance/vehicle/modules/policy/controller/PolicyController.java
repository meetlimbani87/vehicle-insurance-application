package com.insurance.vehicle.modules.policy.controller;

import com.insurance.vehicle.modules.policy.dto.PolicyCreateRequest;
import com.insurance.vehicle.modules.policy.dto.PolicyResponse;
import com.insurance.vehicle.modules.policy.service.PolicyService;
import com.insurance.vehicle.security.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/policies")
public class PolicyController {

    private final PolicyService policyService;

    // Constructor injection: Spring hands us the PolicyService bean
    public PolicyController(PolicyService policyService) {
        this.policyService = policyService;
    }

    // GET /api/policies - every policy belonging to the logged-in user, newest first
    @GetMapping
    public ResponseEntity<List<PolicyResponse>> getMyPolicies(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(policyService.getPoliciesForUser(currentUser.getUser().getId()));
    }

    // GET /api/policies/{id} - a single policy, but only if it belongs to the logged-in user
    @GetMapping("/{id}")
    public ResponseEntity<PolicyResponse> getPolicy(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return ResponseEntity.ok(policyService.getPolicyById(id, currentUser.getUser().getId()));
    }

    // POST /api/policies - creates a new policy (and vehicle, if needed) for the logged-in user
    @PostMapping
    public ResponseEntity<PolicyResponse> createPolicy(
            @Valid @RequestBody PolicyCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            HttpServletRequest httpRequest
    ) {
        PolicyResponse response = policyService.createPolicy(
                currentUser.getUser(), request, httpRequest.getRemoteAddr()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // POST /api/policies/{id}/documents - real multipart upload of supporting documents
    @PostMapping(value = "/{id}/documents", consumes = "multipart/form-data")
    public ResponseEntity<PolicyResponse> uploadDocuments(
            @PathVariable UUID id,
            @RequestParam("files") List<MultipartFile> files,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return ResponseEntity.ok(policyService.uploadDocuments(id, currentUser.getUser(), files));
    }
}
