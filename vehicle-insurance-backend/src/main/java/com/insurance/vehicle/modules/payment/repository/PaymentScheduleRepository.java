package com.insurance.vehicle.modules.payment.repository;

import com.insurance.vehicle.modules.payment.entity.PaymentSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface PaymentScheduleRepository extends JpaRepository<PaymentSchedule, UUID> {

    // A normal user's own payment records (via the policy they belong to), newest due-date first
    List<PaymentSchedule> findAllByPolicy_User_IdOrderByDueDateDesc(UUID userId);

    // Payment schedules for a specific policy
    List<PaymentSchedule> findAllByPolicyId(UUID policyId);

    // Every payment record in the system, newest due-date first - admin view only
    List<PaymentSchedule> findAllByOrderByDueDateDesc();

    // Backs the "receipt number already exists" retry loop when generating a new one
    boolean existsByReceiptNoIgnoreCase(String receiptNo);

    // Backs PaymentReminderScheduler: every not-yet-reminded Pending installment
    // due on or before the cutoff date (covers both "due soon" and "already overdue" in one query)
    List<PaymentSchedule> findAllByStatusAndReminderSentFalseAndDueDateLessThanEqual(String status, LocalDate cutoff);
}
