package com.insurance.vehicle.modules.notification.service;

import com.insurance.vehicle.common.exception.ResourceNotFoundException;
import com.insurance.vehicle.modules.notification.dto.NotificationResponse;
import com.insurance.vehicle.modules.notification.entity.Notification;
import com.insurance.vehicle.modules.notification.mapper.NotificationMapper;
import com.insurance.vehicle.modules.notification.repository.NotificationRepository;
import com.insurance.vehicle.modules.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

// In-app notifications only for now.
// TODO: email sending, needs SMTP credentials first.
@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    public NotificationServiceImpl(NotificationRepository notificationRepository, NotificationMapper notificationMapper) {
        this.notificationRepository = notificationRepository;
        this.notificationMapper = notificationMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(User currentUser) {
        return notificationRepository.findAllByUser_IdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(notificationMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void markAsRead(UUID id, User currentUser) {
        Notification notification = notificationRepository.findByIdAndUser_Id(id, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(User currentUser) {
        List<Notification> unread = notificationRepository.findAllByUser_IdAndReadFalse(currentUser.getId());
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    // Fire-and-forget style, same as AuditLogService.record: called after another
    // action already succeeded, never blocks or rolls back that action
    @Override
    @Transactional
    public void notify(User recipient, String type, String title, String message, String icon) {
        Notification notification = Notification.builder()
                .user(recipient)
                .type(type)
                .title(title)
                .message(message)
                .icon(icon)
                .read(false)
                .build();
        notificationRepository.save(notification);
    }
}
