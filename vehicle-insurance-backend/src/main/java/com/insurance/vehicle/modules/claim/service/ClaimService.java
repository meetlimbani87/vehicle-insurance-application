package com.insurance.vehicle.modules.claim.service;

import com.insurance.vehicle.modules.claim.dto.*;
import com.insurance.vehicle.modules.user.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface ClaimService {

    // Every claim the current user is allowed to see: their own if a customer, all of them if admin
    List<ClaimResponse> getClaims(User currentUser);

    // A single claim, ownership/role-checked
    ClaimResponse getClaimById(UUID id, User currentUser);

    // A claim's history, oldest first
    List<ClaimTimelineResponse> getTimeline(UUID id, User currentUser);

    // Files a new claim against one of the current user's own policies
    ClaimResponse createClaim(User currentUser, ClaimCreateRequest request, String ipAddress);

    // Admin-only: moves a claim to Under Review / Approved / Rejected / Closed
    ClaimResponse updateStatus(UUID id, User currentUser, ClaimStatusUpdateRequest request, String ipAddress);

    // Claim owner (or admin) records the amount actually settled, once Approved
    ClaimResponse updateActualAmount(UUID id, User currentUser, ClaimActualAmountRequest request, String ipAddress);

    // Claim owner (or admin) closes the case out, once settled
    ClaimResponse closeCase(UUID id, User currentUser, String ipAddress);

    // Adds a free-text progress note to the claim
    ClaimResponse addNote(UUID id, User currentUser, ClaimNoteRequest request);

    // Uploads one or more damage photos, appends their URLs to the claim
    ClaimResponse uploadPhotos(UUID id, User currentUser, List<MultipartFile> files);

    // Uploads one or more supporting documents (FIR, license, etc.)
    ClaimResponse uploadDocuments(UUID id, User currentUser, List<MultipartFile> files);
}
