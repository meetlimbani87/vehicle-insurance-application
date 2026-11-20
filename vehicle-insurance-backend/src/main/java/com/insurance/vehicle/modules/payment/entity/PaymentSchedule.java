package com.insurance.vehicle.modules.payment.entity;

import com.insurance.vehicle.modules.policy.entity.Policy;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * One premium installment for a policy.
 *
 * "Overdue" is not stored as a status. PaymentMapper works it out when reading
 * (status == Pending and dueDate is in the past).
 * Maps to `payment_schedules` (V9__create_payment_schedules_table.sql).
 */
@Entity
@Table(name = "payment_schedules")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSchedule {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "policy_id", nullable = false)
    private Policy policy;

    @Column(name = "installment_number", nullable = false)
    private int installmentNumber;

    @Column(nullable = false)
    private int amount;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    // "Pending" | "Paid" - stored as a plain String, same convention as
    // Policy.status/Claim.status; "Overdue" is derived, never stored (see class comment)
    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @Column(name = "receipt_no", unique = true, length = 50)
    private String receiptNo;

    // "one-time" | "monthly" | "quarterly" | "half-yearly" | "annually" - how the
    // policy owner chose to split the premium; every installment generated from
    // the same policy stores the same value, mostly for display purposes
    @Column(name = "payment_interval", nullable = false, length = 20)
    private String paymentInterval;

    // Set true once PaymentReminderScheduler has sent a "due soon"/"overdue"
    // notification for this installment, so it's never sent twice
    @Column(name = "reminder_sent", nullable = false)
    private boolean reminderSent;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) {
            this.status = "Pending";
        }
        if (this.paymentInterval == null) {
            this.paymentInterval = "one-time";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
