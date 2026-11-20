package com.insurance.vehicle.modules.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Shape matches the frontend's Payment interface (src/mock/mockPayments.ts)
 * field-for-field. Used for both the Payment Schedule (calendar) view and
 * the Payment Logs (table) view - the frontend doesn't treat these as
 * different data, just different filters/layouts over the same records.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private String id;
    private String policyId;
    private String policyNumber;
    private int amount;
    private String dueDate;
    private String paidDate;
    private String status; // "Paid" | "Pending" | "Overdue"
    private String receiptNo;
    private String interval; // "one-time" | "monthly" | "quarterly" | "half-yearly" | "annually"
}
