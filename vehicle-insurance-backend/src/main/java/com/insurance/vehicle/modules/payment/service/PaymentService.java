package com.insurance.vehicle.modules.payment.service;

import com.insurance.vehicle.modules.payment.dto.PaymentResponse;
import com.insurance.vehicle.modules.policy.entity.Policy;
import com.insurance.vehicle.modules.user.entity.User;

import java.time.LocalDate;
import java.util.List;

public interface PaymentService {

    // Every payment record the current user is allowed to see: their own if a customer, all of them if admin
    List<PaymentResponse> getPayments(User currentUser);

    // Called by PolicyServiceImpl right after a policy is created - splits the
    // premium into installments per the chosen interval. The first installment
    // is pre-marked Paid (buying the policy activates it; no gateway exists yet
    // to model a real Pending -> Paid transition), every subsequent one is
    // Pending and gets picked up later by PaymentReminderScheduler as its due
    // date approaches.
    void generatePaymentSchedule(Policy policy, String interval, LocalDate firstPaymentDate);
}
