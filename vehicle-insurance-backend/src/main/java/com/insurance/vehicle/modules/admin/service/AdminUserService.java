package com.insurance.vehicle.modules.admin.service;

import com.insurance.vehicle.modules.admin.dto.AdminUserListResponse;
import com.insurance.vehicle.modules.admin.dto.AdminUserUpdateRequest;
import com.insurance.vehicle.modules.user.entity.User;

import java.util.List;
import java.util.UUID;

public interface AdminUserService {

    // Every user in the system, with their policy/claim counts - admin only
    List<AdminUserListResponse> getAllUsers();

    // Suspends or reactivates a user's account. actor is the admin performing
    // the action (for the audit log) - separate from the user being changed.
    AdminUserListResponse updateUserStatus(UUID userId, AdminUserUpdateRequest request, User actor, String ipAddress);
}
