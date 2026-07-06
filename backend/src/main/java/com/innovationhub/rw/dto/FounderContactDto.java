package com.innovationhub.rw.dto;

import com.innovationhub.rw.entity.User;

public record FounderContactDto(
        String fullName,
        String email,
        String phone,
        String company,
        String startupName
) {
    public static FounderContactDto from(User founder, String startupName) {
        return new FounderContactDto(
                founder.getFullName(),
                founder.getEmail(),
                founder.getPhone() != null && !founder.getPhone().isBlank() ? founder.getPhone() : null,
                founder.getCompany(),
                startupName
        );
    }
}
