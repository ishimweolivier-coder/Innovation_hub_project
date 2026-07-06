package com.innovationhub.rw.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SubmitApplicationRequest(
        @NotBlank String startupName,
        @NotBlank String category,
        @NotBlank String description,
        @NotNull Long fundingGoal,
        String businessPlan,
        String budget,
        @NotNull Long budgetAmount,
        @NotNull Long projectedProfit
) {}
