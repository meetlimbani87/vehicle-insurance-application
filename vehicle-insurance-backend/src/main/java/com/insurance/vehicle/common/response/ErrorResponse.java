package com.insurance.vehicle.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * Matches what the frontend's apiFetch() expects on a non-2xx response:
 * it does `err.json()` and reads `err.message`, so "message" must be top-level.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    private int status;
    private String message;
    private List<String> details;
    private String path;
    @Builder.Default
    private Instant timestamp = Instant.now();
}
