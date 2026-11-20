package com.insurance.vehicle.common.exception;

public class UnauthorizedException extends RuntimeException {
    // Thrown for bad login credentials or missing/invalid auth; mapped to HTTP 401
    public UnauthorizedException(String message) {
        super(message);
    }
}
