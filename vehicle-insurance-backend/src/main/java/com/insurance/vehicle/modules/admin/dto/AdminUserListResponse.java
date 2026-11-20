package com.insurance.vehicle.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Shape matches the frontend's User interface (src/mock/mockUsers.ts) field-for-field
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserListResponse {
    private String id;
    private String name;
    private String email;
    private String phone;
    private String role; // "user" | "admin"
    private String status; // "Active" | "Suspended"
    private long policiesCount;
    private long claimsCount;
    private String joinedDate;
}
