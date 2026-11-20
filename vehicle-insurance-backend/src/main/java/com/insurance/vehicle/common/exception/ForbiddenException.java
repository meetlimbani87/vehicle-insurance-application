package com.insurance.vehicle.common.exception;

// Thrown when a logged-in user is authenticated but not allowed to do the
// specific thing they're asking for (e.g. a customer trying to approve their
// own claim, or trying to view someone else's claim) -> HTTP 403.
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
