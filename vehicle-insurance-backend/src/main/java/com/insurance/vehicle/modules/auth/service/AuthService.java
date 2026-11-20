package com.insurance.vehicle.modules.auth.service;

import com.insurance.vehicle.modules.auth.dto.AuthResponse;
import com.insurance.vehicle.modules.auth.dto.LoginRequest;
import com.insurance.vehicle.modules.auth.dto.RegisterRequest;

public interface AuthService {
    // Validates email+password and returns a token + user summary, or throws if invalid
    AuthResponse login(LoginRequest request);
    // Creates a new customer account from the registration form; throws if email is taken or passwords don't match
    void register(RegisterRequest request);
}
