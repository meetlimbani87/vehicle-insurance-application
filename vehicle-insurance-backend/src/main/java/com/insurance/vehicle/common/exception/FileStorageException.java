package com.insurance.vehicle.common.exception;

// Thrown when saving/reading an uploaded file on disk fails for reasons
// outside the user's control (disk I/O error, permissions, etc.) -> HTTP 500.
// Bad *input* about a file (missing file, wrong type) should use
// BadRequestException instead - this is specifically for storage failures.
public class FileStorageException extends RuntimeException {
    public FileStorageException(String message, Throwable cause) {
        super(message, cause);
    }
}
