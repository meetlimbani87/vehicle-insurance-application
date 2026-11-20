package com.insurance.vehicle.modules.user.dto;

import lombok.Data;

// Body of PATCH /api/users/me/notification-preferences. Not a reserved
// filename from the original scaffold (no such file existed) - added since
// none of the reserved DTOs covered this specific action.
@Data
public class NotificationPreferencesRequest {
    private boolean emailNotifications;
    private boolean smsNotifications;
    private boolean inAppNotifications;
}
