package com.insurance.vehicle.modules.policy.service;

import com.insurance.vehicle.common.enums.AuditAction;
import com.insurance.vehicle.common.enums.PolicyStatus;
import com.insurance.vehicle.common.exception.BadRequestException;
import com.insurance.vehicle.common.exception.DuplicateResourceException;
import com.insurance.vehicle.common.exception.ForbiddenException;
import com.insurance.vehicle.common.exception.ResourceNotFoundException;
import com.insurance.vehicle.common.storage.LocalFileStorageService;
import com.insurance.vehicle.modules.audit.service.AuditLogService;
import com.insurance.vehicle.modules.notification.service.NotificationService;
import com.insurance.vehicle.modules.payment.service.PaymentService;
import com.insurance.vehicle.modules.policy.dto.PolicyCreateRequest;
import com.insurance.vehicle.modules.policy.dto.PolicyResponse;
import com.insurance.vehicle.modules.policy.entity.Policy;
import com.insurance.vehicle.modules.policy.entity.Vehicle;
import com.insurance.vehicle.modules.policy.mapper.PolicyMapper;
import com.insurance.vehicle.modules.policy.repository.PolicyRepository;
import com.insurance.vehicle.modules.policy.repository.VehicleRepository;
import com.insurance.vehicle.modules.user.entity.User;
import com.insurance.vehicle.common.enums.UserRole;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

// Policy logic on top of PolicyRepository / VehicleRepository.
@Service
public class PolicyServiceImpl implements PolicyService {

    private final PolicyRepository policyRepository;
    private final VehicleRepository vehicleRepository;
    private final PolicyMapper policyMapper;
    private final PremiumCalculatorService premiumCalculatorService;
    private final AuditLogService auditLogService;
    private final LocalFileStorageService fileStorageService;
    private final PaymentService paymentService;
    private final NotificationService notificationService;

    public PolicyServiceImpl(
            PolicyRepository policyRepository,
            VehicleRepository vehicleRepository,
            PolicyMapper policyMapper,
            PremiumCalculatorService premiumCalculatorService,
            AuditLogService auditLogService,
            LocalFileStorageService fileStorageService,
            PaymentService paymentService,
            NotificationService notificationService
    ) {
        this.policyRepository = policyRepository;
        this.vehicleRepository = vehicleRepository;
        this.policyMapper = policyMapper;
        this.premiumCalculatorService = premiumCalculatorService;
        this.auditLogService = auditLogService;
        this.fileStorageService = fileStorageService;
        this.paymentService = paymentService;
        this.notificationService = notificationService;
    }

    // Fetches every policy owned by this user and converts each to the DTO shape the frontend expects.
    // @Transactional is required here (not just on writes): Policy.documents is a lazy
    // @ElementCollection, and with open-in-view=false the Hibernate session closes as
    // soon as the repository call returns - without this, accessing .getDocuments()
    // inside the mapper throws LazyInitializationException (uncaught -> 500).
    @Override
    @Transactional(readOnly = true)
    public List<PolicyResponse> getPoliciesForUser(UUID userId) {
        return policyRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(policyMapper::toResponse)
                .toList();
    }

    // Looks up one policy by id, but only if it actually belongs to the requesting user
    @Override
    @Transactional(readOnly = true)
    public PolicyResponse getPolicyById(UUID id, UUID userId) {
        Policy policy = policyRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found"));
        return policyMapper.toResponse(policy);
    }

    // Creates a new policy for the owner: resolves/creates the vehicle, validates
    // the date range, calculates the premium, persists the policy, then records
    // an audit entry. All-or-nothing thanks to @Transactional.
    @Override
    @Transactional
    public PolicyResponse createPolicy(User owner, PolicyCreateRequest request, String ipAddress) {
        if (policyRepository.existsByPolicyNumberIgnoreCase(request.getPolicyNumber())) {
            throw new DuplicateResourceException("A policy with this policy number already exists");
        }

        LocalDate startDate = parseDate(request.getStartDate(), "Start date");
        LocalDate endDate = parseDate(request.getEndDate(), "End date");
        if (!endDate.isAfter(startDate)) {
            throw new BadRequestException("End date must be after start date");
        }

        String paymentInterval = request.getPaymentInterval() != null ? request.getPaymentInterval() : "one-time";
        LocalDate firstPaymentDate = parseDate(request.getFirstPaymentDate(), "First payment date");
        if (firstPaymentDate.isBefore(startDate) || firstPaymentDate.isAfter(endDate)) {
            throw new BadRequestException("First payment date must fall within the policy's coverage period");
        }

        Vehicle vehicle = findOrCreateVehicle(request);

        int premium = premiumCalculatorService.calculate(
                request.getVehicleType(), request.getCoverageType(), request.getVehicleYear()
        );

        Policy policy = Policy.builder()
                .user(owner)
                .vehicle(vehicle)
                .policyNumber(request.getPolicyNumber())
                .insuranceCompany(request.getInsuranceCompany())
                .coverageType(request.getCoverageType())
                .startDate(startDate)
                .endDate(endDate)
                .status(PolicyStatus.ACTIVE)
                .premiumAmount(premium)
                .build();

        Policy saved = policyRepository.save(policy);

        auditLogService.record(owner, AuditAction.CREATE, "Policy", saved.getId().toString(), ipAddress);
        paymentService.generatePaymentSchedule(saved, paymentInterval, firstPaymentDate);
        notificationService.notify(owner, "policy", "Policy Created",
                "Your policy " + saved.getPolicyNumber() + " has been created successfully.", "Shield");

        return policyMapper.toResponse(saved);
    }

    // Uploads one or more supporting documents against an owned policy (owner or admin only)
    @Override
    @Transactional
    public PolicyResponse uploadDocuments(UUID id, User currentUser, List<MultipartFile> files) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found"));

        boolean isOwner = policy.getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("You don't have access to this policy");
        }
        fileStorageService.validateBatchSize(files);

        String subDir = "policies/" + id + "/documents";
        for (MultipartFile file : files) {
            policy.getDocuments().add(fileStorageService.store(file, subDir));
        }
        Policy saved = policyRepository.save(policy);

        auditLogService.record(currentUser, AuditAction.UPLOAD, "Policy", saved.getId().toString(), null);
        return policyMapper.toResponse(saved);
    }

    // Reuses the vehicle row if this registration number was already seen before
    // (e.g. renewing an existing vehicle's policy), otherwise registers a new one
    private Vehicle findOrCreateVehicle(PolicyCreateRequest request) {
        return vehicleRepository.findByRegistrationNoIgnoreCase(request.getRegistrationNo())
                .orElseGet(() -> vehicleRepository.save(
                        Vehicle.builder()
                                .make(request.getVehicleMake())
                                .model(request.getVehicleModel())
                                .year(request.getVehicleYear())
                                .registrationNo(request.getRegistrationNo())
                                .vehicleType(request.getVehicleType())
                                .build()
                ));
    }

    // Bean validation already checks the fields are non-blank; this catches
    // strings that aren't actually valid dates (e.g. malformed input)
    private LocalDate parseDate(String value, String fieldLabel) {
        try {
            return LocalDate.parse(value);
        } catch (Exception e) {
            throw new BadRequestException(fieldLabel + " must be a valid date (YYYY-MM-DD)");
        }
    }
}
