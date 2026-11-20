package com.insurance.vehicle.config;

import com.insurance.vehicle.common.enums.PolicyStatus;
import com.insurance.vehicle.common.enums.UserRole;
import com.insurance.vehicle.modules.notification.service.NotificationService;
import com.insurance.vehicle.modules.payment.service.PaymentService;
import com.insurance.vehicle.modules.policy.entity.Policy;
import com.insurance.vehicle.modules.policy.entity.Vehicle;
import com.insurance.vehicle.modules.policy.repository.PolicyRepository;
import com.insurance.vehicle.modules.policy.repository.VehicleRepository;
import com.insurance.vehicle.modules.user.entity.User;
import com.insurance.vehicle.modules.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Dev-only convenience seeding: one demo customer with one vehicle + policy
 * (+ matching payment record), so the app has something to look at right
 * after a fresh `mvn spring-boot:run` without needing to click through
 * registration + the create-policy wizard.
 *
 * Seeds demo Users, Vehicles, Policies and Payments only.
 *
 * The admin account already comes from V1__create_users_table.sql, so it isn't
 * added again here.
 *
 * Skipped in the "prod" profile, this is just demo data.
 */
@Component
@Profile("!prod")
public class DataSeeder implements CommandLineRunner {

    private static final String DEMO_EMAIL = "demo@vehicle.com";
    private static final String DEMO_PASSWORD = "demo1234";

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final PolicyRepository policyRepository;
    private final PasswordEncoder passwordEncoder;
    private final PaymentService paymentService;
    private final NotificationService notificationService;

    public DataSeeder(
            UserRepository userRepository,
            VehicleRepository vehicleRepository,
            PolicyRepository policyRepository,
            PasswordEncoder passwordEncoder,
            PaymentService paymentService,
            NotificationService notificationService
    ) {
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.policyRepository = policyRepository;
        this.passwordEncoder = passwordEncoder;
        this.paymentService = paymentService;
        this.notificationService = notificationService;
    }

    // Runs once on every app startup; each seed step checks for existing data
    // first so re-running it (e.g. every dev restart) never creates duplicates
    @Override
    public void run(String... args) {
        User demoUser = userRepository.findByEmailIgnoreCase(DEMO_EMAIL)
                .orElseGet(this::seedDemoUser);

        if (policyRepository.findAllByUserIdOrderByCreatedAtDesc(demoUser.getId()).isEmpty()) {
            seedDemoPolicy(demoUser);
        }
    }

    // Creates the demo customer account. Login: demo@vehicle.com / demo1234
    private User seedDemoUser() {
        User user = User.builder()
                .name("Demo Customer")
                .email(DEMO_EMAIL)
                .passwordHash(passwordEncoder.encode(DEMO_PASSWORD))
                .phone("9876543210")
                .role(UserRole.USER)
                .status("ACTIVE")
                .emailNotifications(true)
                .smsNotifications(false)
                .inAppNotifications(true)
                .build();
        return userRepository.save(user);
    }

    // Creates one vehicle + one active policy for the demo user
    private void seedDemoPolicy(User owner) {
        Vehicle vehicle = vehicleRepository.findByRegistrationNoIgnoreCase("MH12AB1234")
                .orElseGet(() -> vehicleRepository.save(
                        Vehicle.builder()
                                .make("Maruti Suzuki")
                                .model("Swift")
                                .year("2021")
                                .registrationNo("MH12AB1234")
                                .vehicleType("car")
                                .build()
                ));

        Policy policy = Policy.builder()
                .user(owner)
                .vehicle(vehicle)
                .policyNumber("POL-DEMO-0001")
                .insuranceCompany("SecureLife Insurance Co.")
                .coverageType("comprehensive")
                .startDate(LocalDate.now().minusMonths(1))
                .endDate(LocalDate.now().plusMonths(11))
                .status(PolicyStatus.ACTIVE)
                .premiumAmount(15000)
                .notes("Seeded demo policy")
                .build();

        Policy saved = policyRepository.save(policy);
        paymentService.generatePaymentSchedule(saved, "one-time", saved.getStartDate());
        notificationService.notify(owner, "policy", "Policy Created",
                "Your policy " + saved.getPolicyNumber() + " has been created successfully.", "Shield");
    }
}
