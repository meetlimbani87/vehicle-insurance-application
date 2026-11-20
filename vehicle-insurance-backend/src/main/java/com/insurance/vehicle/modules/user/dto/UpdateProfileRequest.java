package com.insurance.vehicle.modules.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

// Body of PATCH /api/users/me
// Email can't be changed from here, it's the login id so it'd need
// re-verification first.
@Data
public class UpdateProfileRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, message = "Name is required")
    private String name;

    @NotBlank(message = "Phone is required")
    @Size(min = 10, message = "Enter a valid phone number")
    private String phone;

    private String address; // optional
}
