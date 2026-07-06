package com.innovationhub.rw.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.innovationhub.rw.dto.FounderContactDto;
import com.innovationhub.rw.dto.InvestorMatchDto;
import com.innovationhub.rw.dto.StartupDto;
import com.innovationhub.rw.dto.SubmitApplicationRequest;
import com.innovationhub.rw.dto.UpdateStatusRequest;
import com.innovationhub.rw.entity.AiAssessment;
import com.innovationhub.rw.entity.Conversation;
import com.innovationhub.rw.entity.InvestorMatch;
import com.innovationhub.rw.entity.Notification;
import com.innovationhub.rw.entity.Role;
import com.innovationhub.rw.entity.StartupApplication;
import com.innovationhub.rw.entity.User;
import com.innovationhub.rw.entity.WorkflowStage;
import com.innovationhub.rw.repository.ConversationRepository;
import com.innovationhub.rw.repository.InvestorMatchRepository;
import com.innovationhub.rw.repository.NotificationRepository;
import com.innovationhub.rw.repository.StartupApplicationRepository;
import com.innovationhub.rw.repository.StartupInterestRepository;
import com.innovationhub.rw.repository.UserRepository;

@Service
public class ApplicationService {

    private static final Map<String, String> CATEGORY_IMAGES = Map.of(
            "AgriTech", "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80",
            "FinTech", "https://images.unsplash.com/photo-1573497019940-1c28c88b3491?w=800&q=80",
            "HealthTech", "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80",
            "EdTech", "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
            "CleanTech", "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80",
            "E-Commerce", "https://images.unsplash.com/photo-1556767542-52a8fba7584b?w=800&q=80",
            "SaaS", "https://images.unsplash.com/photo-1573497019940-1c28c88b3491?w=800&q=80",
            "Social Impact", "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80",
            "Creative Industries", "https://images.unsplash.com/photo-1556767542-52a8fba7584b?w=800&q=80",
            "Other", "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80"
    );

    private final StartupApplicationRepository applicationRepository;
    private final InvestorMatchRepository investorMatchRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final AiEngineService aiEngineService;
    private final DocumentService documentService;
    private final DocumentValidationService documentValidationService;
    private final StartupInterestRepository interestRepository;
    private final ConversationRepository conversationRepository;

    public ApplicationService(
            StartupApplicationRepository applicationRepository,
            InvestorMatchRepository investorMatchRepository,
            UserRepository userRepository,
            NotificationRepository notificationRepository,
            AiEngineService aiEngineService,
            DocumentService documentService,
            DocumentValidationService documentValidationService,
            StartupInterestRepository interestRepository,
            ConversationRepository conversationRepository
    ) {
        this.applicationRepository = applicationRepository;
        this.investorMatchRepository = investorMatchRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.aiEngineService = aiEngineService;
        this.documentService = documentService;
        this.documentValidationService = documentValidationService;
        this.interestRepository = interestRepository;
        this.conversationRepository = conversationRepository;
    }

    @Transactional(readOnly = true)
    public List<StartupDto> findAll(String status, String category, String search) {
        return applicationRepository.findAllWithDetails().stream()
                .filter(a -> status == null || status.isBlank() || status.equalsIgnoreCase(a.getStatus()))
                .filter(a -> category == null || category.isBlank() || category.equalsIgnoreCase(a.getCategory()))
                .filter(a -> search == null || search.isBlank()
                        || a.getName().toLowerCase().contains(search.toLowerCase())
                        || a.getDescription().toLowerCase().contains(search.toLowerCase()))
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public StartupDto findById(Long id, User viewer) {
        StartupApplication app = applicationRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
        return toDto(app, viewer);
    }

    @Transactional(readOnly = true)
    public StartupDto findById(Long id) {
        return findById(id, null);
    }

    @Transactional(readOnly = true)
    public StartupDto findMyApplication(User founder) {
        StartupApplication app = applicationRepository.findFirstByFounderIdOrderByCreatedAtDesc(founder.getId())
                .orElseThrow(() -> new IllegalArgumentException("No application found"));
        return toDto(app);
    }

    @Transactional
    public StartupDto submit(User founder, SubmitApplicationRequest request,
                             org.springframework.web.multipart.MultipartFile businessPlanFile,
                             org.springframework.web.multipart.MultipartFile budgetFile,
                             String businessPlanMode,
                             String executiveSummary,
                             String marketAnalysis,
                             String productSolution,
                             String growthStrategy,
                             String teamOperations) throws java.io.IOException {
        boolean formPlan = "form".equalsIgnoreCase(businessPlanMode);

        if (budgetFile == null || budgetFile.isEmpty()) {
            throw new IllegalArgumentException("Budget upload is required (PDF or DOCX).");
        }

        if (formPlan) {
            DocumentValidationService.ValidationResult planFormCheck = documentValidationService.validateBusinessPlanForm(
                    executiveSummary, marketAnalysis, productSolution, growthStrategy, teamOperations,
                    request.startupName(), request.category(), request.description()
            );
            if (!planFormCheck.valid()) {
                throw new IllegalArgumentException(planFormCheck.message());
            }
        } else {
            if (businessPlanFile == null || businessPlanFile.isEmpty()) {
                throw new IllegalArgumentException("Upload a business plan (PDF/DOCX) or choose the online form option.");
            }
            DocumentValidationService.ValidationResult planCheck =
                    documentValidationService.validateUpload(businessPlanFile, "business-plan", request);
            if (!planCheck.valid()) {
                throw new IllegalArgumentException(planCheck.message());
            }
        }

        DocumentValidationService.ValidationResult budgetCheck =
                documentValidationService.validateUpload(budgetFile, "budget", request);
        if (!budgetCheck.valid()) {
            throw new IllegalArgumentException(budgetCheck.message());
        }

        StartupApplication app = new StartupApplication();
        app.setName(request.startupName());
        app.setFounder(founder);
        app.setCategory(request.category());
        app.setDescription(request.description());
        app.setStatus("Under Review");
        app.setStage(2);
        app.setFundingGoal(request.fundingGoal());
        app.setFundingRaised(0L);
        app.setCreatedAt(LocalDate.now());
        app.setImage(CATEGORY_IMAGES.getOrDefault(request.category(), CATEGORY_IMAGES.get("Other")));
        app.setBusinessPlan(formPlan ? "business-plan-form.html" : businessPlanFile.getOriginalFilename());
        app.setBudget(budgetFile.getOriginalFilename());
        app.setBudgetAmount(request.budgetAmount());
        app.setProjectedProfit(request.projectedProfit());
        app.setWorkflowStage(WorkflowStage.AI_RUNNING);

        applicationRepository.save(app);

        if (formPlan) {
            documentService.saveBusinessPlanFromForm(
                    app.getId(), app, executiveSummary, marketAnalysis,
                    productSolution, growthStrategy, teamOperations
            );
        } else {
            documentService.saveDocument(app.getId(), "business-plan", businessPlanFile);
        }
        documentService.saveDocument(app.getId(), "budget", budgetFile);
        applicationRepository.save(app);
        runEvaluation(app);

        Notification uploadNotice = new Notification();
        uploadNotice.setUser(founder);
        uploadNotice.setMessage("Documents uploaded for \"" + app.getName() + "\". Business plan and budget received — AI report is being generated for investors.");
        uploadNotice.setType("ai");
        notificationRepository.save(uploadNotice);

        Notification reportNotice = new Notification();
        reportNotice.setUser(founder);
        reportNotice.setMessage("AI evaluation complete for " + app.getName()
                + ". Investors can open your startup to view the business idea report and investment advice.");
        reportNotice.setType("ai");
        notificationRepository.save(reportNotice);

        return toDto(app);
    }

    @Transactional
    public StartupDto runEvaluation(Long id) {
        StartupApplication app = applicationRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
        app.setWorkflowStage(WorkflowStage.AI_RUNNING);
        runEvaluation(app);
        return toDto(app);
    }

    private void runEvaluation(StartupApplication app) {
        List<User> investors = userRepository.findByRole(Role.INVESTOR);
        AiEngineService.EvaluationResult result = aiEngineService.evaluate(app, investors);

        if (app.getAiAssessment() != null) {
            investorMatchRepository.deleteByApplication(app);
        }

        AiAssessment assessment = result.assessment();
        assessment.setApplication(app);
        app.setAiAssessment(assessment);
        app.setWorkflowStage(WorkflowStage.ADMIN_REVIEW);
        applicationRepository.save(app);

        for (InvestorMatchDto matchDto : result.investorMatches()) {
            User investor = userRepository.findById(matchDto.id())
                    .orElseThrow(() -> new IllegalArgumentException("Investor not found"));
            InvestorMatch match = new InvestorMatch();
            match.setApplication(app);
            match.setInvestor(investor);
            match.setMatchScore(matchDto.matchScore());
            match.setCategoryFit(matchDto.categoryFit());
            investorMatchRepository.save(match);
        }
    }

    @Transactional
    public StartupDto updateStatus(Long id, UpdateStatusRequest request) {
        StartupApplication app = applicationRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        app.setStatus(request.status());
        app.setStage(determineStageForStatus(request.status(), request.stage()));

        // Map human-friendly status strings to internal workflow stages so admins
        // can track review -> incubation -> funding -> graduation.
        switch (request.status()) {
            case "Approved" -> app.setWorkflowStage(WorkflowStage.FUNDING_DECISION);
            case "In Incubation" -> app.setWorkflowStage(WorkflowStage.IN_INCUBATION);
            case "Funded" -> app.setWorkflowStage(WorkflowStage.FUNDED);
            case "Graduated" -> app.setWorkflowStage(WorkflowStage.GRADUATED);
            case "Rejected" -> app.setWorkflowStage(WorkflowStage.REJECTED);
            case "Under Review", "Submitted" -> app.setWorkflowStage(WorkflowStage.ADMIN_REVIEW);
            default -> {
                // leave workflowStage unchanged for unknown values
            }
        }

        applicationRepository.save(app);

        Notification notification = new Notification();
        notification.setUser(app.getFounder());
        notification.setMessage("Your application for " + app.getName() + " has been " + request.status().toLowerCase() + ".");
        notification.setType("approved");
        notificationRepository.save(notification);

        return toDto(app);
    }

    private int determineStageForStatus(String status, Integer requestedStage) {
        if (requestedStage != null) {
            return requestedStage;
        }

        return switch (status) {
            case "Submitted" -> 1;
            case "Under Review" -> 2;
            case "Approved" -> 3;
            case "In Incubation" -> 4;
            case "Seeking Funding" -> 5;
            case "Funded" -> 6;
            case "Graduated" -> 7;
            default -> 0;
        };
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getGrowthData(User founder) {
        StartupApplication app = applicationRepository.findFirstByFounderIdOrderByCreatedAtDesc(founder.getId())
                .orElseThrow(() -> new IllegalArgumentException("No application found"));

        List<String> stages = List.of(
                "Submitted", "Under Review", "Approved", "In Incubation",
                "Seeking Funding", "Funded", "Graduated"
        );

        List<Map<String, Object>> milestones = new ArrayList<>();
        for (int i = 0; i < stages.size(); i++) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("title", stages.get(i));
            m.put("date", app.getCreatedAt() != null ? app.getCreatedAt().toString() : "");
            m.put("done", app.getStage() != null && app.getStage() > i + 1);
            milestones.add(m);
        }

        long revenue = app.getFundingRaised() != null ? app.getFundingRaised().longValue() : 0L;
        long projected = app.getAiAssessment() != null && app.getAiAssessment().getExpectedProfit() != null
                ? app.getAiAssessment().getExpectedProfit().longValue() : (app.getProjectedProfit() != null ? app.getProjectedProfit().longValue() : 0L);

        List<Map<String, Object>> metrics = List.of(
                Map.of("month", "Start", "revenue", 0L, "users", 0, "isProjection", false),
                Map.of("month", "Current", "revenue", revenue, "users", Math.max(1, app.getStage() * 50), "isProjection", false),
                Map.of("month", "Projected", "revenue", projected, "users", Math.max(100, app.getStage() * 100), "isProjection", true)
        );

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("startupName", app.getName());
        result.put("fundingRaised", app.getFundingRaised());
        result.put("fundingGoal", app.getFundingGoal());
        result.put("stage", app.getStage());
        result.put("metricsDisclaimer", "User counts and projected revenue are estimates based on program stage and AI scoring — not live telemetry.");
        result.put("metrics", metrics);
        result.put("milestones", milestones);
        return result;
    }

    private StartupDto toDto(StartupApplication app) {
        return toDto(app, null);
    }

    private StartupDto toDto(StartupApplication app, User viewer) {
        List<InvestorMatchDto> matches = InvestorMatchDto.fromList(investorMatchRepository.findByApplication(app));
        List<Map<String, Object>> steps = app.getAiAssessment() != null
                ? aiEngineService.buildDisplaySteps(app.getAiAssessment(), matches)
                : List.of();

        Boolean interestExpressed = null;
        FounderContactDto founderContact = null;
        Long conversationId = null;

        if (viewer != null) {
            if (viewer.getRole() == Role.ADMIN) {
                founderContact = FounderContactDto.from(app.getFounder(), app.getName());
            } else if (viewer.getRole() == Role.ENTREPRENEUR && app.getFounder().getId().equals(viewer.getId())) {
                founderContact = FounderContactDto.from(app.getFounder(), app.getName());
            } else if (viewer.getRole() == Role.INVESTOR) {
                boolean expressed = interestRepository.existsByStartupIdAndInvestorId(app.getId(), viewer.getId());
                interestExpressed = expressed;
                if (expressed) {
                    founderContact = FounderContactDto.from(app.getFounder(), app.getName());
                    conversationId = conversationRepository.findBetweenUsers(app.getFounder(), viewer)
                            .map(Conversation::getId)
                            .orElse(null);
                }
            }
        }

        return StartupDto.from(app, matches, steps, interestExpressed, founderContact, conversationId);
    }
}
