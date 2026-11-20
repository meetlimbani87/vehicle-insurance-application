package com.insurance.vehicle.modules.payment.service;

import com.insurance.vehicle.common.enums.AuditAction;
import com.insurance.vehicle.common.enums.UserRole;
import com.insurance.vehicle.modules.audit.service.AuditLogService;
import com.insurance.vehicle.modules.notification.service.NotificationService;
import com.insurance.vehicle.modules.payment.dto.PaymentResponse;
import com.insurance.vehicle.modules.payment.entity.PaymentSchedule;
import com.insurance.vehicle.modules.payment.mapper.PaymentMapper;
import com.insurance.vehicle.modules.payment.repository.PaymentScheduleRepository;
import com.insurance.vehicle.modules.policy.entity.Policy;
import com.insurance.vehicle.modules.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

// Payment schedules via PaymentScheduleRepository.
// TODO: no real payment gateway yet (no Razorpay/Stripe keys), payments are just marked paid.
@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentScheduleRepository paymentScheduleRepository;
    private final PaymentMapper paymentMapper;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public PaymentServiceImpl(
            PaymentScheduleRepository paymentScheduleRepository,
            PaymentMapper paymentMapper,
            AuditLogService auditLogService,
            NotificationService notificationService
    ) {
        this.paymentScheduleRepository = paymentScheduleRepository;
        this.paymentMapper = paymentMapper;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    // Needs @Transactional: PaymentMapper reads schedule.getPolicy().getPolicyNumber()
    // which is lazy, session would be closed by then otherwise (same issue as Policy/Claim).
    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPayments(User currentUser) {
        List<PaymentSchedule> schedules = currentUser.getRole() == UserRole.ADMIN
                ? paymentScheduleRepository.findAllByOrderByDueDateDesc()
                : paymentScheduleRepository.findAllByPolicy_User_IdOrderByDueDateDesc(currentUser.getId());
        return schedules.stream().map(paymentMapper::toResponse).toList();
    }

    // Splits the policy's premium into installments per the chosen interval.
    // The first installment is paid immediately (buying the policy activates
    // it); every later one is Pending, spaced out from the first due date,
    // and left for PaymentReminderScheduler to remind the owner about later.
    @Override
    @Transactional
    public void generatePaymentSchedule(Policy policy, String interval, LocalDate firstPaymentDate) {
        int installmentCount = installmentCountFor(interval);
        int totalAmount = policy.getPremiumAmount();
        int baseAmount = totalAmount / installmentCount;
        int remainder = totalAmount - (baseAmount * installmentCount); // absorbed into the last installment

        LocalDate dueDate = firstPaymentDate;
        for (int i = 1; i <= installmentCount; i++) {
            boolean isFirst = i == 1;
            int amount = (i == installmentCount) ? baseAmount + remainder : baseAmount;

            PaymentSchedule schedule = PaymentSchedule.builder()
                    .policy(policy)
                    .installmentNumber(i)
                    .amount(amount)
                    .dueDate(dueDate)
                    .paymentInterval(interval)
                    .status(isFirst ? "Paid" : "Pending")
                    .paidDate(isFirst ? policy.getStartDate() : null)
                    .receiptNo(isFirst ? generateReceiptNo() : null)
                    .build();

            PaymentSchedule saved = paymentScheduleRepository.save(schedule);

            if (isFirst) {
                auditLogService.record(policy.getUser(), AuditAction.PAYMENT, "Payment", saved.getId().toString(), null);
                notificationService.notify(policy.getUser(), "payment", "Payment Received",
                        "Payment of \u20b9" + amount + " received for " + policy.getPolicyNumber() + ".", "CreditCard");
            }

            dueDate = advance(dueDate, interval);
        }
    }

    // How many installments a full policy term gets split into for each interval choice
    private int installmentCountFor(String interval) {
        return switch (interval) {
            case "monthly" -> 12;
            case "quarterly" -> 4;
            case "half-yearly" -> 2;
            default -> 1; // "annually" | "one-time"
        };
    }

    private LocalDate advance(LocalDate date, String interval) {
        return switch (interval) {
            case "monthly" -> date.plusMonths(1);
            case "quarterly" -> date.plusMonths(3);
            case "half-yearly" -> date.plusMonths(6);
            default -> date.plusYears(1); // "annually" | "one-time" (loop never actually reaches a second iteration)
        };
    }

    // "REC-4821", retrying on the (extremely unlikely) chance of a collision
    private String generateReceiptNo() {
        String candidate;
        do {
            int suffix = ThreadLocalRandom.current().nextInt(1000, 100000);
            candidate = "REC-" + suffix;
        } while (paymentScheduleRepository.existsByReceiptNoIgnoreCase(candidate));
        return candidate;
    }
}
