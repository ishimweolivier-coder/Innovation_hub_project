package com.innovationhub.rw.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AdminUpdateUserRequest(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotBlank String role,
        String phone,
        String company,
        String investorType,
        String status
) {}
