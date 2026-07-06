package com.innovationhub.rw.entity;

public enum WorkflowStage {
    REGISTERED,
    IDEA_SUBMITTED,
    PLAN_UPLOADED,
    BUDGET_UPLOADED,
    AI_RUNNING,
    UNIQUENESS_DONE,
    RISK_DONE,
    PROFIT_DONE,
    ROI_DONE,
    MATCHED,
    ADMIN_REVIEW,
    FUNDING_DECISION,
    IN_INCUBATION,
    FUNDED,
    GRADUATED,
    REJECTED;

    public String toFrontend() {
        return name().toLowerCase();
    }
}
