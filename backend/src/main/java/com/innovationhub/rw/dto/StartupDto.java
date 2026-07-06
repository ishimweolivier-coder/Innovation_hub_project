package com.innovationhub.rw.dto;

import com.innovationhub.rw.entity.StartupApplication;
import java.util.List;
import java.util.Map;

public record StartupDto(
        Long id,
        String name,
        String founder,
        Long founderId,
        String category,
        String description,
        String status,
        Integer stage,
        Long fundingGoal,
        Long fundingRaised,
        String createdAt,
        String image,
        String businessPlan,
        String budget,
        Long budgetAmount,
        Long projectedProfit,
        String workflowStage,
        AiAssessmentDto aiAssessment,
        List<InvestorMatchDto> investorMatches,
        List<Map<String, Object>> evaluationSteps,
        Boolean interestExpressed,
        FounderContactDto founderContact,
        Long conversationId
) {
    public static StartupDto from(StartupApplication app, List<InvestorMatchDto> matches, List<Map<String, Object>> steps) {
        return from(app, matches, steps, null, null, null);
    }

    public static StartupDto from(
            StartupApplication app,
            List<InvestorMatchDto> matches,
            List<Map<String, Object>> steps,
            Boolean interestExpressed,
            FounderContactDto founderContact,
            Long conversationId
    ) {
        return new StartupDto(
                app.getId(),
                app.getName(),
                app.getFounder().getFullName(),
                app.getFounder().getId(),
                app.getCategory(),
                app.getDescription(),
                app.getStatus(),
                app.getStage(),
                app.getFundingGoal(),
                app.getFundingRaised(),
                app.getCreatedAt().toString(),
                app.getImage(),
                app.getBusinessPlan(),
                app.getBudget(),
                app.getBudgetAmount(),
                app.getProjectedProfit(),
                app.getWorkflowStage() != null ? app.getWorkflowStage().toFrontend() : null,
                AiAssessmentDto.from(app.getAiAssessment()),
                matches != null ? matches : List.of(),
                steps != null ? steps : List.of(),
                interestExpressed,
                founderContact,
                conversationId
        );
    }
}
