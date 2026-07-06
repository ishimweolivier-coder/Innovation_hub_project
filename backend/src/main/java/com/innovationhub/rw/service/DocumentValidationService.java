package com.innovationhub.rw.service;

import com.innovationhub.rw.dto.SubmitApplicationRequest;
import com.innovationhub.rw.entity.StartupApplication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class DocumentValidationService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".pdf", ".docx", ".doc", ".txt");

    private static final List<String> BUSINESS_PLAN_KEYWORDS = List.of(
            "business", "market", "revenue", "strategy", "customer", "product", "startup",
            "executive", "financial", "growth", "competitive", "funding", "investment",
            "company", "solution", "opportunity", "sales", "profit", "vision", "mission",
            "rwanda", "africa", "sector", "operations", "team", "model", "plan"
    );

    private static final List<String> BUDGET_KEYWORDS = List.of(
            "budget", "cost", "expense", "revenue", "profit", "allocation", "total",
            "amount", "forecast", "financial", "funding", "rwf", "line item", "capital",
            "operating", "marketing", "staff", "salary", "equipment", "projection", "year"
    );

    private static final List<String> IRRELEVANT_KEYWORDS = List.of(
            "recipe", "cookbook", "ingredients", "tablespoon", "teaspoon", "tablespoons",
            "preheat", "oven", "bake at", "sauté", "simmer", "cup of flour", "chopped onion",
            "garlic cloves", "mixing bowl", "whisk", "marinate", "season with salt",
            "chapter one", "chapter 1", "novel", "fiction", "poem", "lyrics", "football score",
            "basketball", "match report", "movie review", "song lyrics", "medical diagnosis",
            "prescription drug", "horoscope", "lottery numbers"
    );

    private final DocumentTextExtractor textExtractor;

    public DocumentValidationService(DocumentTextExtractor textExtractor) {
        this.textExtractor = textExtractor;
    }

    public record ValidationResult(boolean valid, List<String> issues) {
        public String message() {
            return String.join(" ", issues);
        }
    }

    public ValidationResult validateBusinessPlanForm(
            String executiveSummary,
            String marketAnalysis,
            String productSolution,
            String growthStrategy,
            String teamOperations,
            String startupName,
            String category,
            String description
    ) {
        String combined = String.join("\n",
                nullToEmpty(executiveSummary), nullToEmpty(marketAnalysis), nullToEmpty(productSolution),
                nullToEmpty(growthStrategy), nullToEmpty(teamOperations));
        if (executiveSummary == null || executiveSummary.isBlank()) {
            return new ValidationResult(false, List.of("Executive summary is required when using the online business plan form."));
        }
        if (marketAnalysis == null || marketAnalysis.isBlank()) {
            return new ValidationResult(false, List.of("Market analysis is required in the business plan form."));
        }
        return validateText(combined, "business-plan", startupName, category, description);
    }

    public ValidationResult validateUpload(MultipartFile file, String documentType, SubmitApplicationRequest request) {
        List<String> issues = new ArrayList<>();

        if (file == null || file.isEmpty()) {
            issues.add(label(documentType) + " file is required.");
            return new ValidationResult(false, issues);
        }

        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase(Locale.ROOT) : "";
        if (!hasAllowedExtension(filename)) {
            issues.add(label(documentType) + " must be PDF, DOCX, DOC, or TXT — not " + extension(filename) + ".");
            return new ValidationResult(false, issues);
        }

        String text;
        try {
            text = extractUploadText(file);
        } catch (IOException e) {
            issues.add(label(documentType) + " could not be read. Upload a valid PDF or Word document.");
            return new ValidationResult(false, issues);
        }

        return validateText(text, documentType, request.startupName(), request.category(), request.description());
    }

    public ValidationResult validateStoredDocuments(StartupApplication app, String businessPlanText, String budgetText) {
        List<String> issues = new ArrayList<>();

        ValidationResult plan = validateText(
                businessPlanText, "business-plan", app.getName(), app.getCategory(), app.getDescription()
        );
        ValidationResult budget = validateText(
                budgetText, "budget", app.getName(), app.getCategory(), app.getDescription()
        );

        if (!plan.valid()) issues.addAll(plan.issues());
        if (!budget.valid()) issues.addAll(budget.issues());
        return new ValidationResult(issues.isEmpty(), issues);
    }

    public ValidationResult validateText(
            String text,
            String documentType,
            String startupName,
            String category,
            String description
    ) {
        List<String> issues = new ArrayList<>();
        String cleaned = text != null ? text.replaceAll("\\s+", " ").trim() : "";
        String lower = cleaned.toLowerCase(Locale.ROOT);

        if (cleaned.length() < minChars(documentType)) {
            issues.add(label(documentType) + " has too little readable text. It may be blank, scanned without OCR, or not a real document.");
        }

        int wordCount = cleaned.isBlank() ? 0 : cleaned.split("\\s+").length;
        if (wordCount < minWords(documentType)) {
            issues.add(label(documentType) + " is too short (" + wordCount + " words). Upload a complete document.");
        }

        int irrelevantHits = countKeywordHits(lower, IRRELEVANT_KEYWORDS);
        int relevantHits = countKeywordHits(lower, keywordsFor(documentType));

        if (irrelevantHits >= 3 && irrelevantHits >= relevantHits) {
            issues.add(label(documentType) + " appears unrelated (e.g. cookbook, story, or random content) — not accepted as a "
                    + label(documentType).toLowerCase() + ".");
        }

        if (relevantHits < minRelevantKeywords(documentType)) {
            issues.add(label(documentType) + " does not contain enough business/financial content to be accepted.");
        }

        if ("budget".equals(documentType) && !containsFinancialNumbers(cleaned)) {
            issues.add("Budget must include numeric amounts (costs, totals, or RWF figures).");
        }

        if (isGeneratedPlaceholder(lower)) {
            issues.add(label(documentType) + " looks like an auto-generated placeholder, not your uploaded file.");
        }

        if (issues.isEmpty() && relevantHits < 6 && !relatesToStartup(lower, startupName, category, description)) {
            issues.add(label(documentType) + " does not appear related to your startup \"" + safe(startupName) + "\".");
        }

        return new ValidationResult(issues.isEmpty(), issues);
    }

    private String extractUploadText(MultipartFile file) throws IOException {
        String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload.bin";
        String ext = extension(original);
        Path temp = Files.createTempFile("doc-validate-", ext);
        try {
            Files.write(temp, file.getBytes());
            return textExtractor.extract(temp);
        } finally {
            Files.deleteIfExists(temp);
        }
    }

    private boolean hasAllowedExtension(String filename) {
        String ext = extension(filename);
        return ALLOWED_EXTENSIONS.contains(ext);
    }

    private String extension(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot).toLowerCase(Locale.ROOT) : "";
    }

    private int minChars(String type) {
        return "budget".equals(type) ? 120 : 350;
    }

    private int minWords(String type) {
        return "budget".equals(type) ? 40 : 80;
    }

    private int minRelevantKeywords(String type) {
        return "budget".equals(type) ? 2 : 4;
    }

    private List<String> keywordsFor(String type) {
        return "budget".equals(type) ? BUDGET_KEYWORDS : BUSINESS_PLAN_KEYWORDS;
    }

    private int countKeywordHits(String text, List<String> keywords) {
        int hits = 0;
        for (String keyword : keywords) {
            if (text.contains(keyword)) hits++;
        }
        return hits;
    }

    private boolean containsFinancialNumbers(String text) {
        return text.matches(".*\\d{2,}.*") || text.toLowerCase(Locale.ROOT).contains("rwf");
    }

    private boolean isGeneratedPlaceholder(String lower) {
        return lower.contains("innovation hub rwanda · business plan document")
                || lower.contains("innovation hub rwanda · budget proposal document");
    }

    private boolean relatesToStartup(String docLower, String startupName, String category, String description) {
        int matches = 0;
        if (startupName != null) {
            for (String word : startupName.toLowerCase(Locale.ROOT).split("\\s+")) {
                if (word.length() >= 4 && docLower.contains(word)) matches++;
            }
        }
        if (category != null && docLower.contains(category.toLowerCase(Locale.ROOT))) matches += 2;
        if (description != null) {
            for (String word : description.toLowerCase(Locale.ROOT).split("\\s+")) {
                if (word.length() >= 5 && docLower.contains(word)) {
                    matches++;
                    if (matches >= 2) return true;
                }
            }
        }
        return matches >= 1;
    }

    private String label(String documentType) {
        return "budget".equals(documentType) ? "Budget" : "Business plan";
    }

    private String nullToEmpty(String value) {
        return value != null ? value : "";
    }

    private String safe(String value) {
        return value != null && !value.isBlank() ? value : "your startup";
    }
}
