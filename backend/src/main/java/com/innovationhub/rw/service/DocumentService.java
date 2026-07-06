package com.innovationhub.rw.service;

import com.innovationhub.rw.entity.StartupApplication;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.NumberFormat;
import java.util.Comparator;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Stream;

@Service
public class DocumentService {

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    private final DocumentTextExtractor textExtractor;

    public DocumentService(DocumentTextExtractor textExtractor) {
        this.textExtractor = textExtractor;
    }

    public void saveDocument(Long applicationId, String type, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return;

        Path dir = Paths.get(uploadDir, "applications", String.valueOf(applicationId));
        Files.createDirectories(dir);

        String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : type + ".pdf";
        String ext = original.contains(".") ? original.substring(original.lastIndexOf('.')) : ".pdf";
        Path target = dir.resolve(type + ext);

        Files.write(target, file.getBytes());
    }

    public void saveBusinessPlanFromForm(
            Long applicationId,
            StartupApplication app,
            String executiveSummary,
            String marketAnalysis,
            String productSolution,
            String growthStrategy,
            String teamOperations
    ) throws IOException {
        Path dir = Paths.get(uploadDir, "applications", String.valueOf(applicationId));
        Files.createDirectories(dir);
        Path target = dir.resolve("business-plan.html");
        Files.writeString(target, generateFormBusinessPlanHtml(
                app, executiveSummary, marketAnalysis, productSolution, growthStrategy, teamOperations
        ));
    }

    private String generateFormBusinessPlanHtml(
            StartupApplication app,
            String executiveSummary,
            String marketAnalysis,
            String productSolution,
            String growthStrategy,
            String teamOperations
    ) {
        NumberFormat nf = NumberFormat.getNumberInstance(Locale.US);
        return """
            <!DOCTYPE html>
            <html><head><meta charset="UTF-8"><title>%s - Business Plan</title></head><body>
            <h1>%s — Business Plan (Online Form)</h1>
            <p><strong>Founder:</strong> %s | <strong>Category:</strong> %s | <strong>Funding Goal:</strong> RWF %s</p>
            <h2>Executive Summary</h2><p>%s</p>
            <h2>Market Analysis</h2><p>%s</p>
            <h2>Product & Solution</h2><p>%s</p>
            <h2>Growth Strategy</h2><p>%s</p>
            <h2>Team & Operations</h2><p>%s</p>
            <h2>Startup Description</h2><p>%s</p>
            </body></html>
            """.formatted(
                app.getName(), app.getName(),
                app.getFounder().getFullName(), app.getCategory(), nf.format(app.getFundingGoal()),
                safe(executiveSummary), safe(marketAnalysis), safe(productSolution),
                safe(growthStrategy), safe(teamOperations), safe(app.getDescription())
        );
    }

    private String safe(String value) {
        return value != null ? value.replace("<", "&lt;") : "";
    }

    public void seedDocuments(StartupApplication app) throws IOException {
        Path dir = Paths.get(uploadDir, "applications", String.valueOf(app.getId()));
        Files.createDirectories(dir);

        Path planPath = dir.resolve("business-plan.html");
        Path budgetPath = dir.resolve("budget.html");

        if (!Files.exists(planPath)) {
            Files.writeString(planPath, generateBusinessPlanHtml(app));
        }
        if (!Files.exists(budgetPath)) {
            Files.writeString(budgetPath, generateBudgetHtml(app));
        }

        app.setBusinessPlan(app.getBusinessPlan() != null ? app.getBusinessPlan() : app.getName() + "-business-plan.html");
        app.setBudget(app.getBudget() != null ? app.getBudget() : app.getName() + "-budget.html");
    }

    public String extractDocumentText(Long applicationId, String type) {
        Path dir = Paths.get(uploadDir, "applications", String.valueOf(applicationId));
        if (!Files.exists(dir)) return "";

        try (Stream<Path> stream = Files.list(dir)) {
            Optional<Path> file = stream
                    .filter(p -> p.getFileName().toString().startsWith(type))
                    .min(Comparator.comparingInt(this::documentPriority));
            if (file.isEmpty()) return "";
            return textExtractor.extract(file.get());
        } catch (IOException e) {
            return "";
        }
    }

    /** Prefer uploaded PDF/DOCX over generated HTML placeholders. */
    private int documentPriority(Path path) {
        String name = path.getFileName().toString().toLowerCase();
        if (name.endsWith(".pdf")) return 0;
        if (name.endsWith(".docx")) return 1;
        if (name.endsWith(".doc")) return 2;
        if (name.endsWith(".html") || name.endsWith(".htm")) return 9;
        return 5;
    }

    public Resource getDocument(StartupApplication app, String type) throws IOException {
        Path dir = Paths.get(uploadDir, "applications", String.valueOf(app.getId()));

        if (Files.exists(dir)) {
            try (var stream = Files.list(dir)) {
                var match = stream
                        .filter(p -> p.getFileName().toString().startsWith(type))
                        .findFirst();
                if (match.isPresent()) {
                    byte[] bytes = Files.readAllBytes(match.get());
                    return new ByteArrayResource(bytes);
                }
            }
        }

        String html = "business-plan".equals(type)
                ? generateBusinessPlanHtml(app)
                : generateBudgetHtml(app);
        return new ByteArrayResource(html.getBytes());
    }

    public String getContentType(StartupApplication app, String type) throws IOException {
        Path dir = Paths.get(uploadDir, "applications", String.valueOf(app.getId()));
        if (Files.exists(dir)) {
            try (var stream = Files.list(dir)) {
                var match = stream
                        .filter(p -> p.getFileName().toString().startsWith(type))
                        .findFirst();
                if (match.isPresent()) {
                    String name = match.get().getFileName().toString().toLowerCase();
                    if (name.endsWith(".pdf")) return "application/pdf";
                    if (name.endsWith(".html") || name.endsWith(".htm")) return "text/html; charset=UTF-8";
                    if (name.endsWith(".doc") || name.endsWith(".docx")) return "application/msword";
                    if (name.endsWith(".xls") || name.endsWith(".xlsx")) return "application/vnd.ms-excel";
                    return "application/octet-stream";
                }
            }
        }
        return "text/html; charset=UTF-8";
    }

    public String getFilename(StartupApplication app, String type) {
        if ("business-plan".equals(type) && app.getBusinessPlan() != null) {
            return app.getBusinessPlan();
        }
        if ("budget".equals(type) && app.getBudget() != null) {
            return app.getBudget();
        }
        return type + ".html";
    }

    private String generateBusinessPlanHtml(StartupApplication app) {
        NumberFormat nf = NumberFormat.getNumberInstance(Locale.US);
        return """
            <!DOCTYPE html>
            <html><head><meta charset="UTF-8"><title>%s - Business Plan</title>
            <style>
              body{font-family:Segoe UI,Arial,sans-serif;max-width:800px;margin:40px auto;padding:0 24px;color:#1f2937;line-height:1.6}
              h1{color:#059669;border-bottom:3px solid #059669;padding-bottom:12px}
              h2{color:#374151;margin-top:28px}
              .meta{background:#f0fdf4;border-left:4px solid #059669;padding:16px;margin:20px 0;border-radius:0 8px 8px 0}
              .label{font-weight:600;color:#6b7280;font-size:13px;text-transform:uppercase}
              table{width:100%%;border-collapse:collapse;margin-top:12px}
              td,th{padding:10px;border:1px solid #e5e7eb;text-align:left}
              th{background:#f9fafb}
            </style></head><body>
            <h1>%s — Business Plan</h1>
            <div class="meta">
              <p><span class="label">Founder</span><br>%s</p>
              <p><span class="label">Category</span><br>%s</p>
              <p><span class="label">Funding Goal</span><br>RWF %s</p>
            </div>
            <h2>Executive Summary</h2>
            <p>%s</p>
            <h2>Market Opportunity</h2>
            <p>%s operates in Rwanda's growing %s sector, addressing local market needs with an innovative, scalable solution tailored for East African communities.</p>
            <h2>Financial Projections</h2>
            <table>
              <tr><th>Metric</th><th>Amount (RWF)</th></tr>
              <tr><td>Budget Required</td><td>%s</td></tr>
              <tr><td>Projected Annual Profit</td><td>%s</td></tr>
              <tr><td>Funding Goal</td><td>%s</td></tr>
            </table>
            <h2>Growth Strategy</h2>
            <p>Phase 1: Product validation and pilot deployment. Phase 2: Scale across Rwanda. Phase 3: Regional expansion in East Africa.</p>
            <p style="margin-top:40px;color:#9ca3af;font-size:12px">Innovation Hub Rwanda · Business Plan Document</p>
            </body></html>
            """.formatted(
                app.getName(), app.getName(),
                app.getFounder().getFullName(),
                app.getCategory(),
                nf.format(app.getFundingGoal()),
                app.getDescription(),
                app.getName(), app.getCategory(),
                nf.format(app.getBudgetAmount()),
                nf.format(app.getProjectedProfit()),
                nf.format(app.getFundingGoal())
        );
    }

    private String generateBudgetHtml(StartupApplication app) {
        NumberFormat nf = NumberFormat.getNumberInstance(Locale.US);
        long budget = app.getBudgetAmount() != null ? app.getBudgetAmount() : 0;
        long profit = app.getProjectedProfit() != null ? app.getProjectedProfit() : 0;
        long goal = app.getFundingGoal() != null ? app.getFundingGoal() : 0;

        return """
            <!DOCTYPE html>
            <html><head><meta charset="UTF-8"><title>%s - Budget Proposal</title>
            <style>
              body{font-family:Segoe UI,Arial,sans-serif;max-width:800px;margin:40px auto;padding:0 24px;color:#1f2937;line-height:1.6}
              h1{color:#059669;border-bottom:3px solid #059669;padding-bottom:12px}
              h2{color:#374151;margin-top:28px}
              table{width:100%%;border-collapse:collapse;margin-top:12px}
              td,th{padding:10px;border:1px solid #e5e7eb;text-align:left}
              th{background:#f9fafb}
              .total{font-weight:bold;background:#f0fdf4}
            </style></head><body>
            <h1>%s — Budget Proposal</h1>
            <h2>Budget Summary</h2>
            <table>
              <tr><th>Line Item</th><th>Amount (RWF)</th><th>Notes</th></tr>
              <tr><td>Operations & Staff</td><td>%s</td><td>40%% of total budget</td></tr>
              <tr><td>Technology & Equipment</td><td>%s</td><td>30%% of total budget</td></tr>
              <tr><td>Marketing & Sales</td><td>%s</td><td>20%% of total budget</td></tr>
              <tr><td>Contingency Reserve</td><td>%s</td><td>10%% of total budget</td></tr>
              <tr class="total"><td>Total Budget</td><td>%s</td><td>—</td></tr>
            </table>
            <h2>Profit Projection</h2>
            <table>
              <tr><th>Item</th><th>Amount (RWF)</th></tr>
              <tr><td>Projected Annual Profit</td><td>%s</td></tr>
              <tr><td>Funding Goal</td><td>%s</td></tr>
              <tr><td>Profit / Budget Ratio</td><td>%.2fx</td></tr>
            </table>
            <h2>Use of Funds</h2>
            <p>Funds will be allocated to scale operations, hire key talent, and expand market reach across Rwanda in line with MINEDUC innovation program guidelines.</p>
            <p style="margin-top:40px;color:#9ca3af;font-size:12px">Innovation Hub Rwanda · Budget Proposal Document</p>
            </body></html>
            """.formatted(
                app.getName(), app.getName(),
                nf.format(Math.round(budget * 0.4)),
                nf.format(Math.round(budget * 0.3)),
                nf.format(Math.round(budget * 0.2)),
                nf.format(Math.round(budget * 0.1)),
                nf.format(budget),
                nf.format(profit),
                nf.format(goal),
                budget > 0 ? (double) profit / budget : 0.0
        );
    }
}
