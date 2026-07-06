package com.innovationhub.rw.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.innovationhub.rw.entity.StartupApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class OpenAiEvaluationService {

    private static final Logger log = LoggerFactory.getLogger(OpenAiEvaluationService.class);

    private final ObjectMapper objectMapper;
    private final DocumentTextExtractor textExtractor;
    private final RestClient restClient;

    @Value("${app.ai.openai.api-key:}")
    private String apiKey;

    @Value("${app.ai.openai.model:gpt-4o-mini}")
    private String model;

    @Value("${app.ai.openai.enabled:true}")
    private boolean enabled;

    @Value("${app.ai.openai.max-document-chars:10000}")
    private int maxDocumentChars;

    public OpenAiEvaluationService(ObjectMapper objectMapper, DocumentTextExtractor textExtractor) {
        this.objectMapper = objectMapper;
        this.textExtractor = textExtractor;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .build();
    }

    public boolean isAvailable() {
        return enabled && apiKey != null && !apiKey.isBlank();
    }

    public String getModelName() {
        return model;
    }

    public record AiAnalysisResult(
            int marketUniqueness,
            int productUniqueness,
            int overallInnovation,
            String riskLevel,
            int riskScore,
            long expectedProfit,
            int expectedROI,
            double rawRoi,
            int descBonus,
            String summary,
            List<String> strengths,
            List<String> concerns,
            List<String> documentInsights,
            boolean documentsValid,
            String validationIssues,
            String investorAdvice
    ) {}

    public AiAnalysisResult analyze(
            StartupApplication app,
            String businessPlanText,
            String budgetText
    ) {
        if (!isAvailable()) {
            throw new IllegalStateException("OpenAI is not configured");
        }

        String planExcerpt = textExtractor.truncate(businessPlanText, maxDocumentChars);
        String budgetExcerpt = textExtractor.truncate(budgetText, maxDocumentChars);

        String prompt = buildPrompt(app, planExcerpt, budgetExcerpt);
        String content = callOpenAi(prompt);
        return parseResponse(content, app);
    }

    private String buildPrompt(StartupApplication app, String businessPlanText, String budgetText) {
        long fundingGoal = app.getFundingGoal() != null ? app.getFundingGoal() : 0;
        long budgetAmount = app.getBudgetAmount() != null ? app.getBudgetAmount() : 0;
        long projectedProfit = app.getProjectedProfit() != null ? app.getProjectedProfit() : 0;

        return """
            You are an expert startup investment analyst for Rwanda's Innovation Hub platform.
            First verify the BUSINESS PLAN and BUDGET texts are real business documents — not cookbooks,
            novels, news articles, or unrelated content. If either document is invalid or unrelated,
            set overallInnovation to 0, riskLevel to "High", riskScore to 95, and explain in summary and concerns.
            Analyze the startup using the application data AND the uploaded business plan and budget text.
            Return ONLY valid JSON with this exact schema (no markdown):
            {
              "documentsValid": true or false,
              "validationIssues": ["issue if documents invalid"],
              "marketUniqueness": 0-100,
              "productUniqueness": 0-100,
              "overallInnovation": 0-100,
              "riskLevel": "Low" | "Medium" | "High",
              "riskScore": 0-100,
              "expectedProfit": number in RWF,
              "expectedROI": 0-120,
              "summary": "2-3 sentence executive summary referencing document content",
              "strengths": ["..."],
              "concerns": ["..."],
              "documentInsights": ["specific insight from business plan or budget"],
              "investorAdvice": "3-5 sentences of actionable advice for an investor considering this startup — strengths to leverage, risks to verify, and recommended next steps"
            }

            STARTUP DATA:
            Name: %s
            Category: %s
            Description: %s
            Funding Goal (RWF): %d
            Budget Amount (RWF): %d
            Projected Profit (RWF): %d

            BUSINESS PLAN TEXT:
            %s

            BUDGET TEXT:
            %s
            """.formatted(
                safe(app.getName()),
                safe(app.getCategory()),
                safe(app.getDescription()),
                fundingGoal,
                budgetAmount,
                projectedProfit,
                businessPlanText.isBlank() ? "[No business plan text extracted]" : businessPlanText,
                budgetText.isBlank() ? "[No budget text extracted]" : budgetText
        );
    }

    private String callOpenAi(String prompt) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        body.put("temperature", 0.2);
        body.put("response_format", Map.of("type", "json_object"));
        body.put("messages", List.of(
                Map.of("role", "system", "content", "You evaluate East African startups for investors. Respond with JSON only."),
                Map.of("role", "user", "content", prompt)
        ));

        String response = restClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);

        try {
            JsonNode root = objectMapper.readTree(response);
            return root.path("choices").path(0).path("message").path("content").asText();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse OpenAI response", e);
        }
    }

    private AiAnalysisResult parseResponse(String json, StartupApplication app) {
        try {
            JsonNode node = objectMapper.readTree(json);
            long fundingGoal = app.getFundingGoal() != null ? app.getFundingGoal() : 1;
            long profit = node.path("expectedProfit").asLong(
                    app.getProjectedProfit() != null ? app.getProjectedProfit() : 0
            );
            double rawRoi = fundingGoal > 0 ? ((double) profit / fundingGoal) * 30 : 0;

            List<String> strengths = readStringList(node.path("strengths"));
            List<String> concerns = readStringList(node.path("concerns"));
            List<String> insights = readStringList(node.path("documentInsights"));
            boolean documentsValid = node.path("documentsValid").asBoolean(true);
            List<String> validationIssues = readStringList(node.path("validationIssues"));

            int innovation = clamp(node.path("overallInnovation").asInt(72));
            String riskLevel = node.path("riskLevel").asText("Medium");
            int riskScore = clamp(node.path("riskScore").asInt(40));
            if (!documentsValid) {
                innovation = 0;
                riskLevel = "High";
                riskScore = Math.max(riskScore, 90);
            }

            return new AiAnalysisResult(
                    clamp(node.path("marketUniqueness").asInt(70)),
                    clamp(node.path("productUniqueness").asInt(70)),
                    innovation,
                    riskLevel,
                    riskScore,
                    Math.max(0, profit),
                    clamp(node.path("expectedROI").asInt(25)),
                    rawRoi,
                    Math.min(25, insights.size() * 3 + strengths.size() * 2),
                    node.path("summary").asText("AI evaluation completed."),
                    strengths,
                    concerns,
                    insights,
                    documentsValid,
                    String.join(" ", validationIssues),
                    node.path("investorAdvice").asText(buildDefaultInvestorAdvice(node, app))
            );
        } catch (Exception e) {
            throw new IllegalStateException("Invalid AI JSON: " + json, e);
        }
    }

    private String buildDefaultInvestorAdvice(JsonNode node, StartupApplication app) {
        String risk = node.path("riskLevel").asText("Medium");
        return "Review the uploaded business plan and budget carefully before investing in "
                + safe(app.getName()) + ". "
                + "Risk level is " + risk + " — schedule a founder meeting to validate market and financial assumptions. "
                + "Consider a staged investment tied to milestones if documentation gaps remain.";
    }

    private List<String> readStringList(JsonNode node) {
        List<String> list = new ArrayList<>();
        if (node.isArray()) {
            node.forEach(n -> list.add(n.asText()));
        }
        return list;
    }

    private int clamp(int value) {
        return Math.min(100, Math.max(0, value));
    }

    private String safe(String value) {
        return value != null ? value : "";
    }
}
