package com.insurance.vehicle.modules.admin.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

// Body of PATCH /api/admin/users/{id}/status
@Data
public class AdminUserUpdateRequest {

    @Pattern(regexp = "^(Active|Suspended)$", message = "Invalid status")
    private String status;
}
