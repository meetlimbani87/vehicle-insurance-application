package com.insurance.vehicle.modules.user.service;

import com.insurance.vehicle.common.exception.BadRequestException;
import com.insurance.vehicle.modules.user.dto.ChangePasswordRequest;
import com.insurance.vehicle.modules.user.dto.NotificationPreferencesRequest;
import com.insurance.vehicle.modules.user.dto.UpdateProfileRequest;
import com.insurance.vehicle.modules.user.dto.UserProfileResponse;
import com.insurance.vehicle.modules.user.entity.User;
import com.insurance.vehicle.modules.user.mapper.UserMapper;
import com.insurance.vehicle.modules.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserProfileResponse getProfile(User currentUser) {
        return userMapper.toResponse(currentUser);
    }

    // currentUser is already a managed/fresh entity loaded for this request
    // (via CustomUserDetailsService), so mutating and saving it directly is safe
    @Override
    @Transactional
    public UserProfileResponse updateProfile(User currentUser, UpdateProfileRequest request) {
        currentUser.setName(request.getName());
        currentUser.setPhone(request.getPhone());
        currentUser.setAddress(request.getAddress());
        User saved = userRepository.save(currentUser);
        return userMapper.toResponse(saved);
    }

    // Defense in depth, same pattern as AuthServiceImpl.register's password-match check
    @Override
    @Transactional
    public void changePassword(User currentUser, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New passwords do not match");
        }
        currentUser.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(currentUser);
    }

    @Override
    @Transactional
    public UserProfileResponse updateNotificationPreferences(User currentUser, NotificationPreferencesRequest request) {
        currentUser.setEmailNotifications(request.isEmailNotifications());
        currentUser.setSmsNotifications(request.isSmsNotifications());
        currentUser.setInAppNotifications(request.isInAppNotifications());
        User saved = userRepository.save(currentUser);
        return userMapper.toResponse(saved);
    }
}
