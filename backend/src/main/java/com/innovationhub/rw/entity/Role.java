package com.innovationhub.rw.entity;

public enum Role {
    ENTREPRENEUR,
    INVESTOR,
    ADMIN;

    public String toFrontend() {
        return name().toLowerCase();
    }

    public static Role fromFrontend(String role) {
        if (role == null) return ENTREPRENEUR;
        return Role.valueOf(role.toUpperCase());
    }
}
