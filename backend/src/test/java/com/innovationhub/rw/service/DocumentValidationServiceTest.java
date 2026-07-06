package com.innovationhub.rw.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DocumentValidationServiceTest {

    private final DocumentValidationService service = new DocumentValidationService(new DocumentTextExtractor());

    @Test
    void rejectsCookbookAsBusinessPlan() {
        String cookbook = """
                Chocolate Chip Cookies Recipe
                Ingredients: 2 cups flour, 1 cup sugar, 2 eggs, chocolate chips.
                Preheat oven to 350F. Mix ingredients in a bowl. Bake for 12 minutes.
                Tablespoon of vanilla. Teaspoon of baking soda. Cookbook page 42.
                """;

        DocumentValidationService.ValidationResult result = service.validateText(
                cookbook, "business-plan", "AgriSmart Rwanda", "AgriTech", "Farm IoT sensors"
        );

        assertFalse(result.valid());
        assertTrue(result.message().toLowerCase().contains("unrelated")
                || result.message().toLowerCase().contains("business"));
    }

    @Test
    void acceptsBusinessPlanWithRelevantContent() {
        String plan = """
                AgriSmart Rwanda Business Plan
                Executive Summary: Our startup delivers IoT sensors for Rwanda farmers to monitor soil and crops.
                Market opportunity in the AgriTech sector across East Africa with strong growth potential.
                Revenue model includes hardware sales and subscription analytics for cooperatives.
                Growth strategy covers pilot deployment, national scale in Rwanda, and regional expansion.
                Funding requirements support product development, field operations, and sales team hiring.
                Financial projections outline revenue, costs, profit, and return on investment for investors.
                Competitive analysis compares local and regional AgriTech providers and our unique product edge.
                Product roadmap details sensor platform, mobile app, dashboard, and partner integrations.
                Sales strategy targets farmer cooperatives, agribusiness partners, and development programs.
                Team and operations section describes founders, advisors, hiring plan, and operational milestones.
                """ + " business market revenue strategy customer product startup financial funding investment ".repeat(3);

        DocumentValidationService.ValidationResult result = service.validateText(
                plan, "business-plan", "AgriSmart Rwanda", "AgriTech",
                "IoT sensors helping Rwanda farmers monitor crops and reduce waste"
        );

        assertTrue(result.valid(), result.message());
    }

    @Test
    void rejectsBudgetWithoutNumbers() {
        String text = """
                This is a story about markets and business strategy without any figures.
                We discuss vision mission team product customer growth sector operations plan funding.
                """;

        DocumentValidationService.ValidationResult result = service.validateText(
                text, "budget", "TestCo", "SaaS", "Software platform"
        );

        assertFalse(result.valid());
    }
}
