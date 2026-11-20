package com.insurance.vehicle.modules.payment.mapper;

import com.insurance.vehicle.modules.payment.dto.PaymentResponse;
import com.insurance.vehicle.modules.payment.entity.PaymentSchedule;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class PaymentMapper {

    // Flattens a PaymentSchedule (plus its linked Policy) into the DTO shape
    // the frontend expects. "Overdue" is computed here rather than stored -
    // a Pending installment becomes Overdue purely by virtue of today's date
    // having passed its due date, with no background job required to flip it.
    public PaymentResponse toResponse(PaymentSchedule schedule) {
        return new PaymentResponse(
                schedule.getId().toString(),
                schedule.getPolicy().getId().toString(),
                schedule.getPolicy().getPolicyNumber(),
                schedule.getAmount(),
                schedule.getDueDate().toString(),
                schedule.getPaidDate() != null ? schedule.getPaidDate().toString() : null,
                displayStatus(schedule),
                schedule.getReceiptNo(),
                schedule.getPaymentInterval()
        );
    }

    private String displayStatus(PaymentSchedule schedule) {
        if ("Pending".equals(schedule.getStatus()) && schedule.getDueDate().isBefore(LocalDate.now())) {
            return "Overdue";
        }
        return schedule.getStatus();
    }
}
