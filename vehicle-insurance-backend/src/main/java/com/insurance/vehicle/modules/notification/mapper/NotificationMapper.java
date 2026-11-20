package com.insurance.vehicle.modules.notification.mapper;

import com.insurance.vehicle.modules.notification.dto.NotificationResponse;
import com.insurance.vehicle.modules.notification.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId().toString(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getCreatedAt().toString(),
                notification.isRead(),
                notification.getIcon()
        );
    }
}
