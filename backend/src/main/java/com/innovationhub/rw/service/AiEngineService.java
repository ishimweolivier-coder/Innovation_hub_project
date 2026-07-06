package com.innovationhub.rw.service;

import com.innovationhub.rw.dto.InvestorMatchDto;
import com.innovationhub.rw.entity.AiAssessment;
import com.innovationhub.rw.entity.StartupApplication;
import com.innovationhub.rw.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AiEngineService {

    private static final Logger log = LoggerFactory.getLogger(AiEngineService.class);

    private final DocumentService documentService;
    private final OpenAiEvaluationService openAiEvaluationService;
    private final DocumentValidationService documentValidationService;

    public AiEngineService(
            DocumentService documentService,
            OpenAiEvaluationService openAiEvaluationService,
            DocumentValidationService documentValidationService
    ) {
        this.documentService = documentService;
        this.openAiEvaluationService = openAiEvaluationService;
        this.documentValidationService = documentValidationService;
    }

    private record CategoryBase(int market, int product, int risk) {}

    private static final Map<String, CategoryBase> CATEGORY_BASE = Map.ofEntries(
            Map.entry("AgriTech", new CategoryBase(72, 68, 28)),
            Map.entry("FinTech", new CategoryBase(65, 70, 42)),
            Map.entry("HealthTech", new CategoryBase(78, 75, 38)),
            Map.entry("EdTech", new CategoryBase(70, 72, 35)),
            Map.entry("CleanTech", new CategoryBase(74, 76, 32)),
            Map.entry("E-Commerce", new CategoryBase(60, 62, 45)),
            Map.entry("SaaS", new CategoryBase(68, 80, 40)),
            Map.entry("Social Impact", new CategoryBase(76, 74, 30)),
            Map.entry("Creative Industries", new CategoryBase(66, 78, 38)),
            Map.entry("Other", new CategoryBase(62, 65, 50))
    );

    private static final List<String> INNOVATION_KEYWORDS = List.of(
            "ai", "iot", "blockchain", "mobile", "platform", "smart", "digital",
            "automation", "sustainable", "innovative", "unique", "scalable", "patent"
    );

    public record EvaluationResult(AiAssessment assessment, List<InvestorMatchDto> investorMatches, List<Map<String, Object>> steps) {}

    public EvaluationResult evaluate(StartupApplication app, List<User> investors) {
        String businessPlanText = app.getId() != null
                ? documentService.extractDocumentText(app.getId(), "business-plan") : "";
        String budgetText = app.getId() != null
                ? documentService.extractDocumentText(app.getId(), "budget") : "";

        DocumentValidationService.ValidationResult validation =
                documentValidationService.validateStoredDocuments(app, businessPlanText, budgetText);
        if (!validation.valid()) {
            return buildInvalidDocumentResult(app, validation);
        }

        if (app.getId() != null && openAiEvaluationService.isAvailable()) {
            try {
                return evaluateWithOpenAi(app, investors, businessPlanText, budgetText);
            } catch (Exception e) {
                log.warn("OpenAI evaluation failed for app {}: {} — falling back to rules engine",
                        app.getId(), e.getMessage());
            }
        }
        return evaluateWithRules(app, investors);
    }

    private EvaluationResult buildInvalidDocumentResult(
            StartupApplication app,
            DocumentValidationService.ValidationResult validation
    ) {
        AiAssessment assessment = new AiAssessment();
        assessment.setApplication(app);
        assessment.setMarketUniqueness(0);
        assessment.setProductUniqueness(0);
        assessment.setOverallInnovation(0);
        assessment.setDescBonus(0);
        assessment.setRiskLevel("High");
        assessment.setRiskScore(95);
        assessment.setExpectedProfit(0L);
        assessment.setExpectedROI(0);
        assessment.setRawRoi(0.0);
        assessment.setDocumentsValid(false);
        assessment.setValidationIssues(validation.message());
        assessment.setAiSummary("Evaluation blocked: uploaded documents failed validation. "
                + validation.message() + " Please upload real business plan and budget files, then re-submit.");
        assessment.setEngineVersion("validation-blocked");
        assessment.setEvaluatedAt(LocalDateTime.now());

        List<Map<String, Object>> steps = List.of(
                step("validation", "Document Validation Failed", validation.message(),
                        List.of(metric("Status", "Documents rejected", true)))
        );
        return new EvaluationResult(assessment, List.of(), steps);
    }

    private EvaluationResult evaluateWithOpenAi(
            StartupApplication app,
            List<User> investors,
            String businessPlanText,
            String budgetText
    ) {
        OpenAiEvaluationService.AiAnalysisResult ai = openAiEvaluationService.analyze(
                app, businessPlanText, budgetText
        );

        AiAssessment assessment = new AiAssessment();
        assessment.setApplication(app);
        assessment.setMarketUniqueness(ai.marketUniqueness());
        assessment.setProductUniqueness(ai.productUniqueness());
        assessment.setOverallInnovation(ai.overallInnovation());
        assessment.setDescBonus(ai.descBonus());
        assessment.setRiskLevel(ai.riskLevel());
        assessment.setRiskScore(ai.riskScore());
        assessment.setExpectedProfit(ai.expectedProfit());
        assessment.setExpectedROI(ai.expectedROI());
        assessment.setRawRoi(ai.rawRoi());
        assessment.setAiSummary(ai.summary());
        assessment.setDocumentsValid(ai.documentsValid());
        assessment.setValidationIssues(ai.validationIssues());
        assessment.setInvestorAdvice(ai.investorAdvice());
        assessment.setEngineVersion(ai.documentsValid()
                ? "openai-" + openAiEvaluationService.getModelName()
                : "validation-blocked");
        assessment.setEvaluatedAt(LocalDateTime.now());

        List<InvestorMatchDto> matches = ai.documentsValid()
                ? matchInvestors(assessment, app.getCategory(), investors)
                : List.of();
        List<Map<String, Object>> steps = buildAiSteps(app, ai, matches);

        return new EvaluationResult(assessment, matches, steps);
    }

    private EvaluationResult evaluateWithRules(StartupApplication app, List<User> investors) {
        String category = app.getCategory() != null ? app.getCategory() : "Other";
        String description = app.getDescription() != null ? app.getDescription() : "";
        String name = app.getName() != null ? app.getName() : "";

        if (app.getId() != null) {
            String planText = documentService.extractDocumentText(app.getId(), "business-plan");
            String budgetText = documentService.extractDocumentText(app.getId(), "budget");
            if (!planText.isBlank()) {
                description = description + " " + planText.substring(0, Math.min(planText.length(), 3000));
            }
            if (!budgetText.isBlank()) {
                description = description + " " + budgetText.substring(0, Math.min(budgetText.length(), 2000));
            }
        }

        long fundingGoal = app.getFundingGoal() != null ? app.getFundingGoal() : 10_000_000L;
        long budgetAmount = app.getBudgetAmount() != null && app.getBudgetAmount() > 0
                ? app.getBudgetAmount()
                : Math.round(fundingGoal * 0.4);
        long projectedProfit = app.getProjectedProfit() != null && app.getProjectedProfit() > 0
                ? app.getProjectedProfit()
                : Math.round(fundingGoal * 0.8);

        UniquenessResult uniqueness = calculateUniqueness(category, description, name);
        RiskResult risk = calculateRisk(category, fundingGoal, budgetAmount, projectedProfit, uniqueness.overallInnovation());
        ProfitResult profit = calculateProfitPrediction(category, projectedProfit, budgetAmount, uniqueness.overallInnovation());
        RoiResult roi = calculateROI(profit.expectedProfit(), fundingGoal, budgetAmount, risk.riskScore(), projectedProfit);

        AiAssessment assessment = new AiAssessment();
        assessment.setApplication(app);
        assessment.setMarketUniqueness(uniqueness.marketUniqueness());
        assessment.setProductUniqueness(uniqueness.productUniqueness());
        assessment.setOverallInnovation(uniqueness.overallInnovation());
        assessment.setDescBonus(uniqueness.descBonus());
        assessment.setRiskLevel(risk.riskLevel());
        assessment.setRiskScore(risk.riskScore());
        assessment.setExpectedProfit(profit.expectedProfit());
        assessment.setExpectedROI(roi.expectedROI());
        assessment.setRawRoi(roi.rawRoi());
        assessment.setDocumentsValid(true);
        assessment.setInvestorAdvice(buildRulesInvestorAdvice(uniqueness, risk, roi, category));
        assessment.setEngineVersion("automated-scoring-1.0");
        assessment.setEvaluatedAt(LocalDateTime.now());

        List<InvestorMatchDto> matches = matchInvestors(assessment, category, investors);
        List<Map<String, Object>> steps = buildSteps(app, category, description, fundingGoal, budgetAmount, projectedProfit,
                uniqueness, risk, profit, roi, matches);

        return new EvaluationResult(assessment, matches, steps);
    }

    private List<Map<String, Object>> buildAiSteps(
            StartupApplication app,
            OpenAiEvaluationService.AiAnalysisResult ai,
            List<InvestorMatchDto> matches
    ) {
        List<Map<String, Object>> steps = new ArrayList<>();

        List<Map<String, Object>> uniquenessMetrics = new ArrayList<>();
        uniquenessMetrics.add(metric("Market Uniqueness", ai.marketUniqueness() + "%", true));
        uniquenessMetrics.add(metric("Product Uniqueness", ai.productUniqueness() + "%", true));
        uniquenessMetrics.add(metric("Overall Innovation", ai.overallInnovation() + "%", true));
        ai.documentInsights().stream()
                .limit(3)
                .forEach(i -> uniquenessMetrics.add(metric("Document insight", i, false)));
        steps.add(step("uniqueness", "Document & Uniqueness Analysis",
                "AI read your business plan and scored innovation at " + ai.overallInnovation() + "%",
                uniquenessMetrics));

        List<Map<String, Object>> riskMetrics = new ArrayList<>();
        riskMetrics.add(metric("Risk Level", ai.riskLevel(), true));
        riskMetrics.add(metric("Risk Score", ai.riskScore() + "/100", true));
        ai.concerns().stream().limit(2).forEach(c -> riskMetrics.add(metric("Concern", c, false)));
        steps.add(step("risk", "Risk Analysis", ai.riskLevel() + " risk (" + ai.riskScore() + "/100)", riskMetrics));

        steps.add(step("profit", "Profit Prediction",
                "RWF " + String.format("%.1f", ai.expectedProfit() / 1_000_000.0) + "M expected",
                List.of(metric("Expected Profit", "RWF " + String.format("%,d", ai.expectedProfit()), true))));

        steps.add(step("roi", "ROI Prediction", ai.expectedROI() + "% expected ROI",
                List.of(metric("Expected ROI", ai.expectedROI() + "%", true))));

        List<Map<String, Object>> matchMetrics = matches.isEmpty()
                ? List.of(metric("Status", "No matches above 55% threshold", false))
                : matches.stream()
                .map(m -> metric(m.name(), m.matchScore() + "% match · " + m.investorType(), true))
                .toList();
        steps.add(step("match", "Investor Matching",
                matches.size() + " investor" + (matches.size() != 1 ? "s" : "") + " matched", matchMetrics));

        if (!ai.strengths().isEmpty()) {
            List<Map<String, Object>> strengthMetrics = ai.strengths().stream()
                    .map(s -> metric("Strength", s, true))
                    .toList();
            steps.add(step("summary", "AI Executive Summary", ai.summary(), strengthMetrics));
        }

        return steps;
    }

    public String getOpenAiStatus() {
        return openAiEvaluationService.isAvailable() ? "configured" : "not-configured";
    }

    // --- original rules engine below ---

    private record UniquenessResult(int marketUniqueness, int productUniqueness, int overallInnovation, int descBonus) {}
    private record RiskResult(int riskScore, String riskLevel) {}
    private record ProfitResult(long expectedProfit) {}
    private record RoiResult(int expectedROI, double rawRoi) {}

    private UniquenessResult calculateUniqueness(String category, String description, String name) {
        CategoryBase base = CATEGORY_BASE.getOrDefault(category, CATEGORY_BASE.get("Other"));
        int descBonus = scoreDescription(description);
        int nameSeed = Math.abs(hashSeed(name)) % 8;

        int marketUniqueness = clamp(base.market() + (int) (descBonus * 0.4) + nameSeed);
        int productUniqueness = clamp(base.product() + (int) (descBonus * 0.6) + (nameSeed % 5));
        int overallInnovation = clamp((int) (marketUniqueness * 0.45 + productUniqueness * 0.55));

        return new UniquenessResult(marketUniqueness, productUniqueness, overallInnovation, descBonus);
    }

    private RiskResult calculateRisk(String category, long fundingGoal, long budgetAmount, long projectedProfit, int overallInnovation) {
        CategoryBase base = CATEGORY_BASE.getOrDefault(category, CATEGORY_BASE.get("Other"));
        int riskScore = base.risk();

        if (fundingGoal > 0 && budgetAmount > 0) {
            double ratio = (double) budgetAmount / fundingGoal;
            if (ratio > 0.8) riskScore += 15;
            else if (ratio < 0.3) riskScore -= 8;
        }

        if (projectedProfit > 0 && budgetAmount > 0) {
            double profitRatio = (double) projectedProfit / budgetAmount;
            if (profitRatio < 1.2) riskScore += 12;
            else if (profitRatio >= 2.5) riskScore -= 10;
        }

        if (fundingGoal > 30_000_000) riskScore += 8;
        if (overallInnovation >= 85) riskScore -= 12;
        else if (overallInnovation < 65) riskScore += 10;

        riskScore = clamp(riskScore, 5, 95);

        String riskLevel = "Medium";
        if (riskScore <= 30) riskLevel = "Low";
        else if (riskScore >= 55) riskLevel = "High";

        return new RiskResult(riskScore, riskLevel);
    }

    private ProfitResult calculateProfitPrediction(String category, long projectedProfit, long budgetAmount, int overallInnovation) {
        CategoryBase base = CATEGORY_BASE.getOrDefault(category, CATEGORY_BASE.get("Other"));
        double modelMultiplier = 1 + (overallInnovation - 70) / 200.0;
        long modelProfit = budgetAmount > 0
                ? Math.round(budgetAmount * (1.8 + base.product() / 100.0) * modelMultiplier)
                : projectedProfit;

        long expectedProfit = projectedProfit > 0
                ? clampLong(Math.round(projectedProfit * 0.85 + modelProfit * 0.15), 0, 999_999_999L)
                : modelProfit;

        return new ProfitResult(expectedProfit);
    }

    private RoiResult calculateROI(long expectedProfit, long fundingGoal, long budgetAmount, int riskScore, long projectedProfit) {
        long investment = fundingGoal > 0 ? fundingGoal : (budgetAmount > 0 ? budgetAmount : 1);
        long profit = projectedProfit > 0 ? projectedProfit : expectedProfit;
        double baseRoi = ((double) profit / investment) * 30;
        double riskAdjustment = (50 - riskScore) / 4.0;
        int expectedROI = clamp((int) Math.round(baseRoi + riskAdjustment), 8, 120);
        return new RoiResult(expectedROI, baseRoi);
    }

    public int calculateInvestorMatchScore(AiAssessment assessment, User investor) {
        if (assessment == null) return 0;

        double score = assessment.getOverallInnovation() * 0.35;
        score += (100 - assessment.getRiskScore()) * 0.25;
        score += Math.min(assessment.getExpectedROI(), 50) * 0.4;

        String type = investor.getInvestorType() != null ? investor.getInvestorType() : "";
        if ("Angel Investor".equals(type) && assessment.getRiskScore() > 50) score -= 10;
        if ("Venture Capital".equals(type) && assessment.getOverallInnovation() < 75) score -= 8;
        if ("Government Fund".equals(type) && "High".equals(assessment.getRiskLevel())) score -= 15;

        return clamp((int) Math.round(score));
    }

    public List<InvestorMatchDto> matchInvestors(AiAssessment assessment, String category, List<User> investors) {
        return investors.stream()
                .map(inv -> new InvestorMatchDto(
                        inv.getId(),
                        inv.getFullName(),
                        inv.getCompany(),
                        inv.getInvestorType(),
                        inv.getMinInnovation(),
                        calculateInvestorMatchScore(assessment, inv),
                        category
                ))
                .filter(m -> m.matchScore() >= 55
                        && assessment.getOverallInnovation() >= (m.minInnovation() != null ? m.minInnovation() - 10 : 55))
                .sorted(Comparator.comparingInt(InvestorMatchDto::matchScore).reversed())
                .toList();
    }

    private List<Map<String, Object>> buildSteps(
            StartupApplication app, String category, String description,
            long fundingGoal, long budgetAmount, long projectedProfit,
            UniquenessResult uniqueness, RiskResult risk, ProfitResult profit, RoiResult roi,
            List<InvestorMatchDto> matches
    ) {
        String text = description.toLowerCase();
        List<String> keywordHits = INNOVATION_KEYWORDS.stream().filter(text::contains).toList();
        double budgetRatio = fundingGoal > 0 ? (double) budgetAmount / fundingGoal : 0;
        double profitRatio = budgetAmount > 0 ? (double) projectedProfit / budgetAmount : 0;
        double rawRoi = fundingGoal > 0 ? ((double) (projectedProfit > 0 ? projectedProfit : profit.expectedProfit()) / fundingGoal) * 30 : 0;

        CategoryBase base = CATEGORY_BASE.getOrDefault(category, CATEGORY_BASE.get("Other"));

        List<Map<String, Object>> steps = new ArrayList<>();

        steps.add(step("uniqueness", "Uniqueness Score",
                "Innovation score: " + uniqueness.overallInnovation() + "%",
                List.of(
                        metric("Market Uniqueness", uniqueness.marketUniqueness() + "%", true),
                        metric("Product Uniqueness", uniqueness.productUniqueness() + "%", true),
                        metric("Overall Innovation", uniqueness.overallInnovation() + "%", true),
                        metric("Category base", category, false),
                        metric("Innovation keywords", keywordHits.isEmpty() ? "none detected" : String.join(", ", keywordHits), false),
                        metric("Description signal", "+" + uniqueness.descBonus() + " pts", false)
                )));

        steps.add(step("risk", "Risk Analysis",
                risk.riskLevel() + " risk (" + risk.riskScore() + "/100)",
                List.of(
                        metric("Risk Level", risk.riskLevel(), true),
                        metric("Risk Score", risk.riskScore() + "/100", true),
                        metric("Category base risk", base.risk() + "/100", false),
                        metric("Budget / Funding ratio", String.format("%.0f%%", budgetRatio * 100), false),
                        metric("Profit / Budget ratio", String.format("%.2f", profitRatio), false),
                        metric("Innovation adjustment", uniqueness.overallInnovation() >= 85 ? "−12 (high innovation)" : "standard", false)
                )));

        steps.add(step("profit", "Profit Prediction",
                "RWF " + String.format("%.1f", profit.expectedProfit() / 1_000_000.0) + "M expected",
                List.of(
                        metric("Expected Profit", "RWF " + String.format("%,d", profit.expectedProfit()), true),
                        metric("Your projection", "RWF " + String.format("%,d", projectedProfit), false),
                        metric("Budget amount", "RWF " + String.format("%,d", budgetAmount), false),
                        metric("Model weight", "85% user + 15% category model", false)
                )));

        steps.add(step("roi", "ROI Prediction",
                roi.expectedROI() + "% expected ROI",
                List.of(
                        metric("Expected ROI", roi.expectedROI() + "%", true),
                        metric("Raw ROI", String.format("%.1f%%", rawRoi), false),
                        metric("Funding goal", "RWF " + String.format("%,d", fundingGoal), false),
                        metric("Risk adjustment", String.format("%.1f pts", (50 - risk.riskScore()) / 5.0), false)
                )));

        List<Map<String, Object>> matchMetrics = matches.isEmpty()
                ? List.of(metric("Status", "No matches above 55% threshold", false))
                : matches.stream()
                .map(m -> metric(m.name(), m.matchScore() + "% match · " + m.investorType(), true))
                .toList();

        steps.add(step("match", "Investor Matching",
                matches.size() + " investor" + (matches.size() != 1 ? "s" : "") + " matched",
                matchMetrics));

        return steps;
    }

    private Map<String, Object> step(String id, String title, String summary, List<Map<String, Object>> metrics) {
        Map<String, Object> step = new LinkedHashMap<>();
        step.put("id", id);
        step.put("title", title);
        step.put("summary", summary);
        step.put("metrics", metrics);
        return step;
    }

    private Map<String, Object> metric(String label, String value, boolean highlight) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("label", label);
        m.put("value", value);
        if (highlight) m.put("highlight", true);
        return m;
    }

    private int scoreDescription(String description) {
        String text = description.toLowerCase();
        String[] words = text.split("\\s+");
        int score = 0;

        if (words.length >= 15) score += 12;
        else if (words.length >= 8) score += 6;

        long keywordHits = INNOVATION_KEYWORDS.stream().filter(text::contains).count();
        score += Math.min((int) keywordHits * 4, 20);

        if (text.matches(".*\\d+%.*")) score += 5;
        if (text.contains("rwanda") || text.contains("africa")) score += 4;

        return clamp(score, 0, 25);
    }

    private int hashSeed(String str) {
        int h = 0;
        for (int i = 0; i < str.length(); i++) {
            h = (h << 5) - h + str.charAt(i);
        }
        return Math.abs(h);
    }

    private int clamp(int value) {
        return clamp(value, 0, 100);
    }

    private int clamp(int value, int min, int max) {
        return Math.min(max, Math.max(min, Math.round(value)));
    }

    private long clampLong(long value, long min, long max) {
        return Math.min(max, Math.max(min, value));
    }

    public List<Map<String, Object>> buildDisplaySteps(AiAssessment assessment, List<InvestorMatchDto> matches) {
        List<Map<String, Object>> steps = new ArrayList<>();

        List<Map<String, Object>> uniquenessMetrics = List.of(
                metric("Market Uniqueness", assessment.getMarketUniqueness() + "%", true),
                metric("Product Uniqueness", assessment.getProductUniqueness() + "%", true),
                metric("Overall Innovation", assessment.getOverallInnovation() + "%", true)
        );
        steps.add(step("uniqueness", "Uniqueness Analysis",
                "Innovation score: " + assessment.getOverallInnovation() + "%", uniquenessMetrics));

        List<Map<String, Object>> riskMetrics = List.of(
                metric("Risk Level", assessment.getRiskLevel(), true),
                metric("Risk Score", assessment.getRiskScore() + "/100", true)
        );
        steps.add(step("risk", "Risk Analysis",
                assessment.getRiskLevel() + " risk (" + assessment.getRiskScore() + "/100)", riskMetrics));

        steps.add(step("profit", "Profit Prediction",
                "RWF " + String.format("%.1f", assessment.getExpectedProfit() / 1_000_000.0) + "M expected",
                List.of(metric("Expected Profit", "RWF " + String.format("%,d", assessment.getExpectedProfit()), true))));

        steps.add(step("roi", "ROI Prediction", assessment.getExpectedROI() + "% expected ROI",
                List.of(metric("Expected ROI", assessment.getExpectedROI() + "%", true))));

        List<Map<String, Object>> matchMetrics = matches.isEmpty()
                ? List.of(metric("Status", "No matches above threshold", false))
                : matches.stream()
                .map(m -> metric(m.name(), m.matchScore() + "% match · " + m.investorType(), true))
                .toList();
        steps.add(step("match", "Investor Matching",
                matches.size() + " investor" + (matches.size() != 1 ? "s" : "") + " matched", matchMetrics));

        return steps;
    }

    private String buildRulesInvestorAdvice(
            UniquenessResult uniqueness,
            RiskResult risk,
            RoiResult roi,
            String category
    ) {
        StringBuilder advice = new StringBuilder();
        if (uniqueness.overallInnovation() >= 75) {
            advice.append("Strong innovation score — this ").append(category).append(" idea shows differentiation worth exploring. ");
        } else {
            advice.append("Moderate innovation — ask the founder how they defend against local competitors. ");
        }
        advice.append("Risk is ").append(risk.riskLevel()).append(" (").append(risk.riskScore()).append("/100): verify unit economics and customer traction. ");
        advice.append("Expected ROI around ").append(roi.expectedROI()).append("% is a projection — request audited financials or pilot results before committing. ");
        advice.append("Recommend an intro meeting and due diligence on the business plan and budget documents.");
        return advice.toString();
    }
}
