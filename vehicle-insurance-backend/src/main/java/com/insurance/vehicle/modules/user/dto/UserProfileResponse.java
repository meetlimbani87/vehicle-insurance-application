package com.insurance.vehicle.modules.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Full editable profile shape for GET/PATCH /users/me - a superset of
// AuthResponse.UserSummary (which stays minimal, just for the login response)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String role; // "user" | "admin" (lowercase, matches frontend type)
    private boolean emailNotifications;
    private boolean smsNotifications;
    private boolean inAppNotifications;
}
