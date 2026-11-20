package com.insurance.vehicle.modules.notification.service;

import com.insurance.vehicle.modules.notification.dto.NotificationResponse;
import com.insurance.vehicle.modules.user.entity.User;

import java.util.List;
import java.util.UUID;

public interface NotificationService {

    // The current user's own notifications, newest first
    List<NotificationResponse> getNotifications(User currentUser);

    // Marks one notification as read, ownership-checked
    void markAsRead(UUID id, User currentUser);

    // Marks every one of the current user's unread notifications as read
    void markAllAsRead(User currentUser);

    // Creates a notification for a user. Called by other modules' services as a
    // side effect of their own actions (e.g. PolicyServiceImpl after a policy is
    // created) - mirrors how AuditLogService.record(...) is already used.
    void notify(User recipient, String type, String title, String message, String icon);
}
