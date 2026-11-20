package com.insurance.vehicle.common.exception;

public class BadRequestException extends RuntimeException {
    // Thrown for invalid input/business-rule violations; mapped to HTTP 400 by GlobalExceptionHandler
    public BadRequestException(String message) {
        super(message);
    }
}
