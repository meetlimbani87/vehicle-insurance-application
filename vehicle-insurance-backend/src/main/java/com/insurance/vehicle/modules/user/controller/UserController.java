package com.insurance.vehicle.modules.user.controller;

import com.insurance.vehicle.modules.user.dto.*;
import com.insurance.vehicle.modules.user.service.UserService;
import com.insurance.vehicle.security.CustomUserDetails;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // GET /api/users/me - the current user's full profile
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(userService.getProfile(currentUser.getUser()));
    }

    // PATCH /api/users/me - updates name/phone/address
    @PatchMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return ResponseEntity.ok(userService.updateProfile(currentUser.getUser(), request));
    }

    // PATCH /api/users/me/password - verifies current password, sets a new one
    @PatchMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        userService.changePassword(currentUser.getUser(), request);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/users/me/notification-preferences
    @PatchMapping("/me/notification-preferences")
    public ResponseEntity<UserProfileResponse> updateNotificationPreferences(
            @RequestBody NotificationPreferencesRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return ResponseEntity.ok(userService.updateNotificationPreferences(currentUser.getUser(), request));
    }
}
