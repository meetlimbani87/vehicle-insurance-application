package com.insurance.vehicle.modules.payment.controller;

import com.insurance.vehicle.modules.payment.dto.PaymentResponse;
import com.insurance.vehicle.modules.payment.service.PaymentService;
import com.insurance.vehicle.security.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // GET /api/payments - the current user's own payment records, or every record if they're an admin
    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getPayments(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(paymentService.getPayments(currentUser.getUser()));
    }
}
