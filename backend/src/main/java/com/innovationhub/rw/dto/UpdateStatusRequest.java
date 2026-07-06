package com.innovationhub.rw.dto;

public record UpdateStatusRequest(
        String status,
        Integer stage
) {}
