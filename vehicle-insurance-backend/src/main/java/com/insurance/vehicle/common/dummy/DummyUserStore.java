package com.insurance.vehicle.common.dummy;

import com.insurance.vehicle.common.enums.UserRole;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Shared in-memory "table" of users, seeded to match the frontend's mockUsers.ts
 * exactly, so any page (auth, dashboard, admin) sees the same demo data.
 *
 * TEMPORARY: replaced by a real UserRepository + Postgres once we move past
 * the dummy-data phase.
 */
@Component
public class DummyUserStore {

    private final List<UserRecord> users = new CopyOnWriteArrayList<>();
    private final AtomicInteger idSeq = new AtomicInteger(11); // next id after seed data (u1..u10)

    // Seeds the in-memory list with the fixed admin account plus 10 demo customers on app startup
    public DummyUserStore() {
        // Dedicated admin login as specified: admin@vehicle.com / admin123
        users.add(new UserRecord("admin1", "System Admin", "admin@vehicle.com", "admin123", "9999999999", UserRole.ADMIN, "Active", 0, 0, "2023-01-01"));

        // Demo customer accounts — all share the password "password123" for now (dummy phase)
        users.add(new UserRecord("u1", "Rahul Sharma", "rahul@example.com", "password123", "9876543210", UserRole.USER, "Active", 3, 5, "2023-06-01"));
        users.add(new UserRecord("u2", "Priya Patel", "priya@example.com", "password123", "9876543211", UserRole.USER, "Active", 2, 1, "2023-08-15"));
        users.add(new UserRecord("u3", "Amit Kumar", "amit@example.com", "password123", "9876543212", UserRole.USER, "Active", 1, 0, "2024-01-10"));
        users.add(new UserRecord("u4", "Sneha Reddy", "sneha@example.com", "password123", "9876543213", UserRole.USER, "Suspended", 2, 3, "2023-09-20"));
        users.add(new UserRecord("u5", "Vikram Singh", "vikram@example.com", "password123", "9876543214", UserRole.USER, "Active", 4, 2, "2023-05-12"));
        users.add(new UserRecord("u6", "Meera Nair", "meera@example.com", "password123", "9876543215", UserRole.USER, "Active", 1, 1, "2024-02-28"));
        users.add(new UserRecord("u7", "Karan Malhotra", "karan@example.com", "password123", "9876543216", UserRole.USER, "Active", 3, 4, "2023-11-05"));
        users.add(new UserRecord("u8", "Deepa Iyer", "deepa@example.com", "password123", "9876543217", UserRole.USER, "Suspended", 1, 2, "2024-03-15"));
        users.add(new UserRecord("u9", "Arjun Verma", "arjun@example.com", "password123", "9876543218", UserRole.ADMIN, "Active", 0, 0, "2023-01-01"));
        users.add(new UserRecord("u10", "Nisha Gupta", "nisha@example.com", "password123", "9876543219", UserRole.USER, "Active", 2, 1, "2024-04-01"));
    }

    // Returns every user in the store (used by admin user-list pages later)
    public List<UserRecord> findAll() {
        return users;
    }

    // Looks up a single user by email, case-insensitively; used by login to check credentials
    public Optional<UserRecord> findByEmail(String email) {
        return users.stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(email))
                .findFirst();
    }

    // Quick true/false check used by registration to reject duplicate emails
    public boolean existsByEmail(String email) {
        return findByEmail(email).isPresent();
    }

    // Adds a new user (assigning it the next "uN" id if it doesn't have one) — used by registration
    public UserRecord save(UserRecord user) {
        if (user.getId() == null) {
            user.setId("u" + idSeq.getAndIncrement());
        }
        users.add(user);
        return user;
    }
}
