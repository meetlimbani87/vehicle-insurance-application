package com.insurance.vehicle.modules.auth.service;

import com.insurance.vehicle.common.enums.UserRole;
import com.insurance.vehicle.common.exception.BadRequestException;
import com.insurance.vehicle.common.exception.DuplicateResourceException;
import com.insurance.vehicle.common.exception.UnauthorizedException;
import com.insurance.vehicle.modules.auth.dto.AuthResponse;
import com.insurance.vehicle.modules.auth.dto.LoginRequest;
import com.insurance.vehicle.modules.auth.dto.RegisterRequest;
import com.insurance.vehicle.modules.user.entity.User;
import com.insurance.vehicle.modules.user.repository.UserRepository;
import com.insurance.vehicle.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

// Login/register. Users are in Postgres, passwords hashed with BCrypt, JWT on login.
@Service
public class AuthServiceImpl implements AuthService {

    private static final String INVALID_CREDENTIALS_MESSAGE = "Invalid email or password";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        // Step 1: does this email exist at all?
        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE));

        // Step 2: does the raw password match the stored BCrypt hash?
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
        }

        // Step 3: a suspended account shouldn't be able to log in even with the right password
        if ("SUSPENDED".equalsIgnoreCase(user.getStatus())) {
            throw new UnauthorizedException("This account has been suspended. Please contact support.");
        }

        // Step 4: mint a real signed JWT carrying the user's id/email/role
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        AuthResponse.UserSummary summary = new AuthResponse.UserSummary(
                user.getId().toString(),
                user.getName(),
                user.getEmail(),
                user.getRole().name().toLowerCase(Locale.ROOT),
                user.getPhone()
        );

        return new AuthResponse(token, summary);
    }

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        // Defense in depth: frontend already checks this, but the backend shouldn't trust it blindly
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }
        // Can't have two accounts sharing an email
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        // New signups always start as a plain customer (USER role), active
        User newUser = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(UserRole.USER)
                .status("ACTIVE")
                // Explicit defaults: Java booleans default to false, which would silently
                // override the DB column's DEFAULT true for these two if left unset here
                .emailNotifications(true)
                .smsNotifications(false)
                .inAppNotifications(true)
                .build();

        userRepository.save(newUser);
    }
}
