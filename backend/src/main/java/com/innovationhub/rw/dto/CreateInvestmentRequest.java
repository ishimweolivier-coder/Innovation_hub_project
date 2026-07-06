package com.innovationhub.rw.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateInvestmentRequest(
        @NotNull Long startupId,
        Long investorId,
        @NotNull @Min(1) Long amount,
        String status
) {}
