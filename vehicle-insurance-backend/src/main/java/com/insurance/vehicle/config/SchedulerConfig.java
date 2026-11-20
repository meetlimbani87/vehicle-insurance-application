package com.insurance.vehicle.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

// Turns on Spring's @Scheduled support project-wide - currently used by
// PaymentReminderScheduler to check for upcoming/overdue payment installments.
@Configuration
@EnableScheduling
public class SchedulerConfig {
}
