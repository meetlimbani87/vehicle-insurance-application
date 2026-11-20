package com.insurance.vehicle.modules.claim.service;

import com.insurance.vehicle.common.enums.AuditAction;
import com.insurance.vehicle.common.enums.PolicyStatus;
import com.insurance.vehicle.common.enums.UserRole;
import com.insurance.vehicle.common.exception.BadRequestException;
import com.insurance.vehicle.common.exception.ForbiddenException;
import com.insurance.vehicle.common.exception.ResourceNotFoundException;
import com.insurance.vehicle.common.storage.LocalFileStorageService;
import com.insurance.vehicle.modules.audit.service.AuditLogService;
import com.insurance.vehicle.modules.claim.dto.*;
import com.insurance.vehicle.modules.claim.entity.Claim;
import com.insurance.vehicle.modules.claim.entity.ClaimTimelineEvent;
import com.insurance.vehicle.modules.claim.mapper.ClaimMapper;
import com.insurance.vehicle.modules.claim.repository.ClaimRepository;
import com.insurance.vehicle.modules.claim.repository.ClaimTimelineRepository;
import com.insurance.vehicle.modules.notification.service.NotificationService;
import com.insurance.vehicle.modules.policy.entity.Policy;
import com.insurance.vehicle.modules.policy.repository.PolicyRepository;
import com.insurance.vehicle.modules.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

// Claim logic on top of ClaimRepository / ClaimTimelineRepository.
// Damage assessment (points, eligibility, AI confidence) isn't handled here,
// that's the AI module's job.
@Service
public class ClaimServiceImpl implements ClaimService {

    private final ClaimRepository claimRepository;
    private final ClaimTimelineRepository claimTimelineRepository;
    private final PolicyRepository policyRepository;
    private final ClaimMapper claimMapper;
    private final AuditLogService auditLogService;
    private final LocalFileStorageService fileStorageService;
    private final NotificationService notificationService;

    public ClaimServiceImpl(
            ClaimRepository claimRepository,
            ClaimTimelineRepository claimTimelineRepository,
            PolicyRepository policyRepository,
            ClaimMapper claimMapper,
            AuditLogService auditLogService,
            LocalFileStorageService fileStorageService,
            NotificationService notificationService
    ) {
        this.claimRepository = claimRepository;
        this.claimTimelineRepository = claimTimelineRepository;
        this.policyRepository = policyRepository;
        this.claimMapper = claimMapper;
        this.auditLogService = auditLogService;
        this.fileStorageService = fileStorageService;
        this.notificationService = notificationService;
    }

    // Needs @Transactional: notes/photos/documents on Claim are lazy collections and
    // open-in-view is off, so ClaimMapper's getNotes()/getPhotos()/getDocuments()
    // would throw LazyInitializationException (-> 500). Same fix as PolicyServiceImpl.
    @Override
    @Transactional(readOnly = true)
    public List<ClaimResponse> getClaims(User currentUser) {
        List<Claim> claims = isAdmin(currentUser)
                ? claimRepository.findAllByOrderByFiledDateDesc()
                : claimRepository.findAllByPolicy_User_IdOrderByFiledDateDesc(currentUser.getId());
        return claims.stream().map(claimMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ClaimResponse getClaimById(UUID id, User currentUser) {
        Claim claim = findClaimOrThrow(id);
        assertCanView(claim, currentUser);
        return claimMapper.toResponse(claim);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClaimTimelineResponse> getTimeline(UUID id, User currentUser) {
        Claim claim = findClaimOrThrow(id);
        assertCanView(claim, currentUser);
        return claimTimelineRepository.findAllByClaim_IdOrderByCreatedAtAsc(id).stream()
                .map(e -> new ClaimTimelineResponse(e.getStatus(), e.getNote(), e.getCreatedAt().toString()))
                .toList();
    }

    // Validates the policy is really the current user's and is active, snapshots
    // the vehicle details onto the claim, generates a unique claim number, then
    // records both a timeline entry and an audit log entry in the same transaction.
    @Override
    @Transactional
    public ClaimResponse createClaim(User currentUser, ClaimCreateRequest request, String ipAddress) {
        Policy policy = resolveOwnedPolicy(request.getPolicyId(), currentUser);

        if (policy.getStatus() != PolicyStatus.ACTIVE) {
            throw new BadRequestException("Claims can only be filed against an active policy");
        }

        LocalDate accidentDate = parseDate(request.getAccidentDate(), "Accident date");
        if (accidentDate.isAfter(LocalDate.now())) {
            throw new BadRequestException("Accident date cannot be in the future");
        }

        Claim claim = Claim.builder()
                .claimNumber(generateClaimNumber())
                .policy(policy)
                .accidentDate(accidentDate)
                .location(request.getLocation())
                .description(request.getDescription())
                .status("Filed")
                .filedDate(LocalDate.now())
                .vehicleMake(policy.getVehicle().getMake())
                .vehicleModel(policy.getVehicle().getModel())
                .registrationNo(policy.getVehicle().getRegistrationNo())
                .build();

        Claim saved = claimRepository.save(claim);
        recordTimelineEvent(saved, "Filed", "Claim filed");
        auditLogService.record(currentUser, AuditAction.CREATE, "Claim", saved.getId().toString(), ipAddress);
        notificationService.notify(currentUser, "claim", "Claim Filed",
                "Your claim " + saved.getClaimNumber() + " has been filed and is awaiting review.", "FileText");

        return claimMapper.toResponse(saved);
    }

    // Admin-only: moves the claim to a new status, with a matching audit action per status
    @Override
    @Transactional
    public ClaimResponse updateStatus(UUID id, User currentUser, ClaimStatusUpdateRequest request, String ipAddress) {
        Claim claim = findClaimOrThrow(id);
        assertCanManage(claim, currentUser);
        String newStatus = request.getStatus();
        claim.setStatus(newStatus);
        Claim saved = claimRepository.save(claim);

        recordTimelineEvent(saved, newStatus, "Status changed to " + newStatus);
        auditLogService.record(currentUser, actionForStatus(newStatus), "Claim", saved.getId().toString(), ipAddress);
        // Notify the claimant (not the admin who made the change) that their claim moved
        notificationService.notify(saved.getPolicy().getUser(), "claim", "Claim " + newStatus,
                "Your claim " + saved.getClaimNumber() + " is now " + newStatus.toLowerCase() + ".", iconForStatus(newStatus));

        return claimMapper.toResponse(saved);
    }

    // The claimant (or admin) records what was actually settled, once the claim is Approved
    @Override
    @Transactional
    public ClaimResponse updateActualAmount(UUID id, User currentUser, ClaimActualAmountRequest request, String ipAddress) {
        Claim claim = findClaimOrThrow(id);
        assertCanManage(claim, currentUser);

        if (!"Approved".equals(claim.getStatus())) {
            throw new BadRequestException("Actual amount can only be set once a claim is approved");
        }
        if (claim.getActualAmount() != null) {
            throw new BadRequestException("Actual amount has already been recorded for this claim");
        }

        claim.setActualAmount(request.getActualAmount());
        Claim saved = claimRepository.save(claim);

        recordTimelineEvent(saved, saved.getStatus(), "Actual settlement amount recorded: " + request.getActualAmount());
        auditLogService.record(currentUser, AuditAction.PAYMENT, "Claim", saved.getId().toString(), ipAddress);

        return claimMapper.toResponse(saved);
    }

    // The claimant (or admin) closes the case out, once it's approved and settled
    @Override
    @Transactional
    public ClaimResponse closeCase(UUID id, User currentUser, String ipAddress) {
        Claim claim = findClaimOrThrow(id);
        assertCanManage(claim, currentUser);

        if (!"Approved".equals(claim.getStatus()) || claim.getActualAmount() == null) {
            throw new BadRequestException("A claim can only be closed once it's approved and the amount is settled");
        }

        claim.setStatus("Closed");
        Claim saved = claimRepository.save(claim);

        recordTimelineEvent(saved, "Closed", "Case closed");
        auditLogService.record(currentUser, AuditAction.CLOSE, "Claim", saved.getId().toString(), ipAddress);

        return claimMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ClaimResponse addNote(UUID id, User currentUser, ClaimNoteRequest request) {
        Claim claim = findClaimOrThrow(id);
        assertCanManage(claim, currentUser);

        claim.getNotes().add(request.getNote());
        Claim saved = claimRepository.save(claim);

        return claimMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ClaimResponse uploadPhotos(UUID id, User currentUser, List<MultipartFile> files) {
        Claim claim = findClaimOrThrow(id);
        assertCanManage(claim, currentUser);
        fileStorageService.validateBatchSize(files);

        String subDir = "claims/" + id + "/photos";
        for (MultipartFile file : files) {
            claim.getPhotos().add(fileStorageService.store(file, subDir));
        }
        Claim saved = claimRepository.save(claim);

        auditLogService.record(currentUser, AuditAction.UPLOAD, "Claim", saved.getId().toString(), null);
        return claimMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ClaimResponse uploadDocuments(UUID id, User currentUser, List<MultipartFile> files) {
        Claim claim = findClaimOrThrow(id);
        assertCanManage(claim, currentUser);
        fileStorageService.validateBatchSize(files);

        String subDir = "claims/" + id + "/documents";
        for (MultipartFile file : files) {
            claim.getDocuments().add(fileStorageService.store(file, subDir));
        }
        Claim saved = claimRepository.save(claim);

        auditLogService.record(currentUser, AuditAction.UPLOAD, "Claim", saved.getId().toString(), null);
        return claimMapper.toResponse(saved);
    }

    // --- helpers ---

    private Claim findClaimOrThrow(UUID id) {
        return claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));
    }

    // A policy that both exists and actually belongs to the requesting user
    private Policy resolveOwnedPolicy(String policyId, User currentUser) {
        UUID uuid;
        try {
            uuid = UUID.fromString(policyId);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Select a valid policy");
        }
        return policyRepository.findByIdAndUserId(uuid, currentUser.getId())
                .orElseThrow(() -> new BadRequestException("Select a valid policy of yours"));
    }

    private boolean isAdmin(User user) {
        return user.getRole() == UserRole.ADMIN;
    }

    // A customer may only view/manage their own claim; an admin may view/manage any
    private boolean isOwner(Claim claim, User user) {
        return claim.getPolicy().getUser().getId().equals(user.getId());
    }

    private void assertCanView(Claim claim, User user) {
        if (!isAdmin(user) && !isOwner(claim, user)) {
            throw new ForbiddenException("You don't have access to this claim");
        }
    }

    private void assertCanManage(Claim claim, User user) {
        if (!isAdmin(user) && !isOwner(claim, user)) {
            throw new ForbiddenException("You don't have access to this claim");
        }
    }

    private void recordTimelineEvent(Claim claim, String status, String note) {
        claimTimelineRepository.save(ClaimTimelineEvent.builder()
                .claim(claim)
                .status(status)
                .note(note)
                .build());
    }

    // Approve/Reject/Close map to their matching audit action; anything else
    // (e.g. "Under Review") is a plain update
    private AuditAction actionForStatus(String status) {
        return switch (status) {
            case "Approved" -> AuditAction.APPROVE;
            case "Rejected" -> AuditAction.REJECT;
            case "Closed" -> AuditAction.CLOSE;
            default -> AuditAction.UPDATE;
        };
    }

    // Matching lucide-react icon name for each status, for the notification bell
    private String iconForStatus(String status) {
        return switch (status) {
            case "Approved" -> "CheckCircle";
            case "Rejected" -> "XCircle";
            case "Closed" -> "CheckCircle";
            default -> "FileText";
        };
    }

    // "CLM-2026-4821", retrying on the (extremely unlikely) chance of a collision
    private String generateClaimNumber() {
        String candidate;
        do {
            int suffix = ThreadLocalRandom.current().nextInt(1000, 10000);
            candidate = "CLM-" + Year.now().getValue() + "-" + suffix;
        } while (claimRepository.existsByClaimNumberIgnoreCase(candidate));
        return candidate;
    }

    private LocalDate parseDate(String value, String fieldLabel) {
        try {
            return LocalDate.parse(value);
        } catch (Exception e) {
            throw new BadRequestException(fieldLabel + " must be a valid date (YYYY-MM-DD)");
        }
    }
}
