package com.insurance.vehicle.modules.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Shape matches the frontend's Notification interface (src/mock/mockNotifications.ts) field-for-field
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private String id;
    private String type;
    private String title;
    private String message;
    private String timestamp;
    private boolean read;
    private String icon;
}
