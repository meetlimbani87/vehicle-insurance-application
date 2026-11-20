package com.insurance.vehicle.modules.admin.service;

import com.insurance.vehicle.common.enums.AuditAction;
import com.insurance.vehicle.common.exception.ResourceNotFoundException;
import com.insurance.vehicle.modules.admin.dto.AdminUserListResponse;
import com.insurance.vehicle.modules.admin.dto.AdminUserUpdateRequest;
import com.insurance.vehicle.modules.audit.service.AuditLogService;
import com.insurance.vehicle.modules.claim.repository.ClaimRepository;
import com.insurance.vehicle.modules.notification.service.NotificationService;
import com.insurance.vehicle.modules.policy.repository.PolicyRepository;
import com.insurance.vehicle.modules.user.entity.User;
import com.insurance.vehicle.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

// Admin only. The ADMIN role check lives in SecurityConfig, so no per-method
// checks here (nothing in this module is customer facing).
@Service
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final PolicyRepository policyRepository;
    private final ClaimRepository claimRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public AdminUserServiceImpl(
            UserRepository userRepository,
            PolicyRepository policyRepository,
            ClaimRepository claimRepository,
            AuditLogService auditLogService,
            NotificationService notificationService
    ) {
        this.userRepository = userRepository;
        this.policyRepository = policyRepository;
        this.claimRepository = claimRepository;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminUserListResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public AdminUserListResponse updateUserStatus(UUID userId, AdminUserUpdateRequest request, User actor, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // "Active"/"Suspended" (frontend) <-> "ACTIVE"/"SUSPENDED" (stored) - same
        // convention as Policy/Claim's plain-string status fields
        String storedStatus = request.getStatus().toUpperCase();
        user.setStatus(storedStatus);
        User saved = userRepository.save(user);

        boolean suspended = "SUSPENDED".equals(storedStatus);
        auditLogService.record(actor, suspended ? AuditAction.SUSPEND : AuditAction.UPDATE, "User", saved.getId().toString(), ipAddress);
        notificationService.notify(saved, "system",
                suspended ? "Account Suspended" : "Account Reactivated",
                suspended ? "Your account has been suspended. Contact support if you believe this is a mistake."
                        : "Your account has been reactivated.",
                "AlertTriangle");

        return toResponse(saved);
    }

    private AdminUserListResponse toResponse(User user) {
        long policiesCount = policyRepository.countByUserId(user.getId());
        long claimsCount = claimRepository.countByPolicy_User_Id(user.getId());
        String displayStatus = "SUSPENDED".equalsIgnoreCase(user.getStatus()) ? "Suspended" : "Active";

        return new AdminUserListResponse(
                user.getId().toString(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name().toLowerCase(),
                displayStatus,
                policiesCount,
                claimsCount,
                user.getCreatedAt().toLocalDate().toString()
        );
    }
}
