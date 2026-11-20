package com.insurance.vehicle.common.dummy;

import com.insurance.vehicle.common.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Plain in-memory stand-in for the future JPA `User` entity.
 * Mirrors the shape of the frontend's src/mock/mockUsers.ts so every
 * module (auth, dashboard, admin users, etc.) can share one consistent
 * dummy dataset until a real database is wired in.
 *
 * NOTE: password is stored in PLAIN TEXT here deliberately — this is the
 * dummy-data phase. Once a real DB is wired in, this gets replaced with
 * a hashed password column + BCrypt.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRecord {
    private String id;
    private String name;
    private String email;
    private String password;
    private String phone;
    private UserRole role;
    private String status; // "Active" | "Suspended"
    private int policiesCount;
    private int claimsCount;
    private String joinedDate;
}
