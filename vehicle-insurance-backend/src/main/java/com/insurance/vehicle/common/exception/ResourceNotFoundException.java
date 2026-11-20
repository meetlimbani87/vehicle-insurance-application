package com.insurance.vehicle.common.exception;

public class ResourceNotFoundException extends RuntimeException {
    // Thrown when a lookup by id/key finds nothing; mapped to HTTP 404
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
