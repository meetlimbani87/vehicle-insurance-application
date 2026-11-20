package com.insurance.vehicle.modules.notification.controller;

import com.insurance.vehicle.modules.notification.dto.NotificationResponse;
import com.insurance.vehicle.modules.notification.service.NotificationService;
import com.insurance.vehicle.security.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // GET /api/notifications - the current user's own notifications, newest first
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(notificationService.getNotifications(currentUser.getUser()));
    }

    // PATCH /api/notifications/{id}/read - marks one notification as read
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id, @AuthenticationPrincipal CustomUserDetails currentUser) {
        notificationService.markAsRead(id, currentUser.getUser());
        return ResponseEntity.noContent().build();
    }

    // POST /api/notifications/read-all - marks every unread notification as read
    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal CustomUserDetails currentUser) {
        notificationService.markAllAsRead(currentUser.getUser());
        return ResponseEntity.noContent().build();
    }
}
