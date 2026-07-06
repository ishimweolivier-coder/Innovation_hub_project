package com.innovationhub.rw.dto;

public record AuthResponse(
        String token,
        UserDto user
) {}
