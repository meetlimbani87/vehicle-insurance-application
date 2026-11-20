package com.insurance.vehicle.modules.notification.repository;

import com.insurance.vehicle.modules.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    // A user's own notifications, newest first
    List<Notification> findAllByUser_IdOrderByCreatedAtDesc(UUID userId);

    // Ownership-scoped single lookup, for marking one as read
    Optional<Notification> findByIdAndUser_Id(UUID id, UUID userId);

    // Backs "mark all as read" - only touches this user's currently-unread rows
    List<Notification> findAllByUser_IdAndReadFalse(UUID userId);
}
