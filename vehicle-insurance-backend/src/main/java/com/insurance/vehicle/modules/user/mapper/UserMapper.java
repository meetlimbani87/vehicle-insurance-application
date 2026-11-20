package com.insurance.vehicle.modules.user.mapper;

import com.insurance.vehicle.modules.user.dto.UserProfileResponse;
import com.insurance.vehicle.modules.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserProfileResponse toResponse(User user) {
        return new UserProfileResponse(
                user.getId().toString(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getRole().name().toLowerCase(),
                user.isEmailNotifications(),
                user.isSmsNotifications(),
                user.isInAppNotifications()
        );
    }
}
