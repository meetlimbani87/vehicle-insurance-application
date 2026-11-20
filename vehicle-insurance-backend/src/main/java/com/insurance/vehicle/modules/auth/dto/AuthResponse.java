package com.insurance.vehicle.modules.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Shape matches exactly what the frontend's useLogin()/useCurrentUser() expect:
 * { token, user: { id, name, email, role, phone } }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private UserSummary user;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummary {
        private String id;
        private String name;
        private String email;
        private String role; // "user" | "admin" (lowercase, matches frontend type)
        private String phone;
    }
}
