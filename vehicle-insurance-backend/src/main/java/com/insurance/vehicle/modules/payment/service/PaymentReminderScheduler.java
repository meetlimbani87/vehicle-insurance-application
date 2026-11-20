package com.insurance.vehicle.modules.payment.service;

import com.insurance.vehicle.modules.notification.service.NotificationService;
import com.insurance.vehicle.modules.payment.entity.PaymentSchedule;
import com.insurance.vehicle.modules.payment.repository.PaymentScheduleRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Sends a "payment due" (or "payment overdue") notification for every Pending
 * installment that hasn't been reminded about yet, once its due date is
 * within REMINDER_WINDOW_DAYS or has already passed.
 *
 * Runs hourly rather than once a day - this is a demo/dev app without real
 * money changing hands, so a shorter interval makes the feature actually
 * observable without waiting for a real day boundary. In a production
 * deployment with a real gateway, once daily (e.g. a cron of "0 0 8 * * *"
 * for 8am) would be the more normal choice.
 */
@Component
public class PaymentReminderScheduler {

    private static final int REMINDER_WINDOW_DAYS = 7;

    private final PaymentScheduleRepository paymentScheduleRepository;
    private final NotificationService notificationService;

    public PaymentReminderScheduler(PaymentScheduleRepository paymentScheduleRepository, NotificationService notificationService) {
        this.paymentScheduleRepository = paymentScheduleRepository;
        this.notificationService = notificationService;
    }

    // Runs once on startup (initialDelay = 0) and then every hour
    @Scheduled(initialDelay = 0, fixedRate = 60 * 60 * 1000)
    @Transactional
    public void sendDuePaymentReminders() {
        LocalDate cutoff = LocalDate.now().plusDays(REMINDER_WINDOW_DAYS);
        List<PaymentSchedule> due = paymentScheduleRepository
                .findAllByStatusAndReminderSentFalseAndDueDateLessThanEqual("Pending", cutoff);

        for (PaymentSchedule schedule : due) {
            boolean isOverdue = schedule.getDueDate().isBefore(LocalDate.now());
            String title = isOverdue ? "Payment Overdue" : "Payment Due Soon";
            String message = isOverdue
                    ? "Your payment of \u20b9" + schedule.getAmount() + " for " + schedule.getPolicy().getPolicyNumber() + " was due on " + schedule.getDueDate() + "."
                    : "Your payment of \u20b9" + schedule.getAmount() + " for " + schedule.getPolicy().getPolicyNumber() + " is due on " + schedule.getDueDate() + ".";

            notificationService.notify(schedule.getPolicy().getUser(), "payment", title, message, "CreditCard");

            schedule.setReminderSent(true);
            paymentScheduleRepository.save(schedule);
        }
    }
}
