package com.innovationhub.rw.dto;

import com.innovationhub.rw.entity.User;

public record UserDto(
        Long id,
        String fullName,
        String email,
        String role,
        String avatar,
        String company,
        String phone,
        String investorType,
        String status
) {
    public static UserDto from(User user) {
        return new UserDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().toFrontend(),
                user.getAvatar(),
                user.getCompany(),
                user.getPhone(),
                user.getInvestorType(),
                user.getStatus().name().substring(0, 1) + user.getStatus().name().substring(1).toLowerCase()
        );
    }
}
