package com.insurance.vehicle.modules.user.service;

import com.insurance.vehicle.modules.user.dto.ChangePasswordRequest;
import com.insurance.vehicle.modules.user.dto.NotificationPreferencesRequest;
import com.insurance.vehicle.modules.user.dto.UpdateProfileRequest;
import com.insurance.vehicle.modules.user.dto.UserProfileResponse;
import com.insurance.vehicle.modules.user.entity.User;

public interface UserService {

    // The current user's own full profile
    UserProfileResponse getProfile(User currentUser);

    // Updates name/phone/address for the current user
    UserProfileResponse updateProfile(User currentUser, UpdateProfileRequest request);

    // Verifies the current password, then sets a new one
    void changePassword(User currentUser, ChangePasswordRequest request);

    // Updates which notification channels the current user wants
    UserProfileResponse updateNotificationPreferences(User currentUser, NotificationPreferencesRequest request);
}
