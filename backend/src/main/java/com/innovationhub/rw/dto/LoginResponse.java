package com.innovationhub.rw.dto;

public record LoginResponse(
        boolean requiresOtp,
        String token,
        UserDto user,
        String email,
        String message,
        Integer expiresInMinutes
) {
    public static LoginResponse complete(String token, UserDto user) {
        return new LoginResponse(false, token, user, null, null, null);
    }

    public static LoginResponse otpRequired(String email, String message, int expiresInMinutes) {
        return new LoginResponse(true, null, null, email, message, expiresInMinutes);
    }
}
