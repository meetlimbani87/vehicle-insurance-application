package com.insurance.vehicle.modules.claim.controller;

import com.insurance.vehicle.modules.claim.dto.*;
import com.insurance.vehicle.modules.claim.service.ClaimService;
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
@RequestMapping("/claims")
public class ClaimController {

    private final ClaimService claimService;
    private final com.insurance.vehicle.modules.ai.service.ClaimAiAssessmentService claimAiAssessmentService;

    public ClaimController(
            ClaimService claimService,
            com.insurance.vehicle.modules.ai.service.ClaimAiAssessmentService claimAiAssessmentService
    ) {
        this.claimService = claimService;
        this.claimAiAssessmentService = claimAiAssessmentService;
    }

    // GET /api/claims - the current user's own claims, or every claim if they're an admin
    @GetMapping
    public ResponseEntity<List<ClaimResponse>> getClaims(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(claimService.getClaims(currentUser.getUser()));
    }

    // GET /api/claims/{id} - a single claim, ownership/role-checked
    @GetMapping("/{id}")
    public ResponseEntity<ClaimResponse> getClaim(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return ResponseEntity.ok(claimService.getClaimById(id, currentUser.getUser()));
    }

    // GET /api/claims/{id}/timeline - the claim's real history, oldest first
    @GetMapping("/{id}/timeline")
    public ResponseEntity<List<ClaimTimelineResponse>> getTimeline(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return ResponseEntity.ok(claimService.getTimeline(id, currentUser.getUser()));
    }

    // POST /api/claims - files a new claim against one of the current user's own policies
    @PostMapping
    public ResponseEntity<ClaimResponse> createClaim(
            @Valid @RequestBody ClaimCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            HttpServletRequest httpRequest
    ) {
        ClaimResponse response = claimService.createClaim(currentUser.getUser(), request, httpRequest.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // PATCH /api/claims/{id}/status - admin-only (Approve/Reject/etc.)
    @PatchMapping("/{id}/status")
    public ResponseEntity<ClaimResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ClaimStatusUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            HttpServletRequest httpRequest
    ) {
        ClaimResponse response = claimService.updateStatus(id, currentUser.getUser(), request, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(response);
    }

    // PATCH /api/claims/{id}/actual-amount - claim owner (or admin) records the settled amount
    @PatchMapping("/{id}/actual-amount")
    public ResponseEntity<ClaimResponse> updateActualAmount(
            @PathVariable UUID id,
            @Valid @RequestBody ClaimActualAmountRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            HttpServletRequest httpRequest
    ) {
        ClaimResponse response = claimService.updateActualAmount(id, currentUser.getUser(), request, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(response);
    }

    // POST /api/claims/{id}/close - claim owner (or admin) closes the case out
    @PostMapping("/{id}/close")
    public ResponseEntity<ClaimResponse> closeCase(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            HttpServletRequest httpRequest
    ) {
        ClaimResponse response = claimService.closeCase(id, currentUser.getUser(), httpRequest.getRemoteAddr());
        return ResponseEntity.ok(response);
    }

    // POST /api/claims/{id}/notes - adds a free-text progress note
    @PostMapping("/{id}/notes")
    public ResponseEntity<ClaimResponse> addNote(
            @PathVariable UUID id,
            @Valid @RequestBody ClaimNoteRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return ResponseEntity.ok(claimService.addNote(id, currentUser.getUser(), request));
    }

    // POST /api/claims/{id}/photos - real multipart upload of one or more damage photos
    @PostMapping(value = "/{id}/photos", consumes = "multipart/form-data")
    public ResponseEntity<ClaimResponse> uploadPhotos(
            @PathVariable UUID id,
            @RequestParam("files") List<MultipartFile> files,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return ResponseEntity.ok(claimService.uploadPhotos(id, currentUser.getUser(), files));
    }

    // POST /api/claims/{id}/documents - real multipart upload of supporting documents
    @PostMapping(value = "/{id}/documents", consumes = "multipart/form-data")
    public ResponseEntity<ClaimResponse> uploadDocuments(
            @PathVariable UUID id,
            @RequestParam("files") List<MultipartFile> files,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return ResponseEntity.ok(claimService.uploadDocuments(id, currentUser.getUser(), files));
    }

    // POST /api/claims/{id}/ai-assessment - triggers AI claim eligibility & damage assessment
    @PostMapping("/{id}/ai-assessment")
    public ResponseEntity<ClaimResponse> assessClaim(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return ResponseEntity.ok(claimAiAssessmentService.assessClaim(id, currentUser.getUser()));
    }
}
