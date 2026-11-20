package com.insurance.vehicle.common.exception;

public class DuplicateResourceException extends RuntimeException {
    // Thrown when trying to create something that already exists (e.g. email already registered); mapped to HTTP 409
    public DuplicateResourceException(String message) {
        super(message);
    }
}
