package com.innovationhub.rw.controller;

import com.innovationhub.rw.dto.*;
import com.innovationhub.rw.security.UserPrincipal;
import com.innovationhub.rw.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping
    public List<StartupDto> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search
    ) {
        return applicationService.findAll(status, category, search);
    }

    @GetMapping("/me")
    public StartupDto myApplication(@AuthenticationPrincipal UserPrincipal principal) {
        return applicationService.findMyApplication(principal.getUser());
    }

    @GetMapping("/{id}")
    public StartupDto getById(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return applicationService.findById(id, principal != null ? principal.getUser() : null);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public StartupDto submitMultipart(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam String startupName,
            @RequestParam String category,
            @RequestParam String description,
            @RequestParam Long fundingGoal,
            @RequestParam Long budgetAmount,
            @RequestParam Long projectedProfit,
            @RequestParam(defaultValue = "upload") String businessPlanMode,
            @RequestParam(required = false) String executiveSummary,
            @RequestParam(required = false) String marketAnalysis,
            @RequestParam(required = false) String productSolution,
            @RequestParam(required = false) String growthStrategy,
            @RequestParam(required = false) String teamOperations,
            @RequestPart(value = "businessPlan", required = false) MultipartFile businessPlan,
            @RequestPart(value = "budget", required = false) MultipartFile budget
    ) throws IOException {
        SubmitApplicationRequest request = new SubmitApplicationRequest(
                startupName, category, description, fundingGoal,
                businessPlan != null ? businessPlan.getOriginalFilename() : "business-plan-form.html",
                budget != null ? budget.getOriginalFilename() : null,
                budgetAmount, projectedProfit
        );
        return applicationService.submit(
                principal.getUser(), request, businessPlan, budget, businessPlanMode,
                executiveSummary, marketAnalysis, productSolution, growthStrategy, teamOperations
        );
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public StartupDto submit(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SubmitApplicationRequest request
    ) throws IOException {
        return applicationService.submit(
                principal.getUser(), request, null, null, "upload",
                null, null, null, null, null
        );
    }

    @PostMapping("/{id}/evaluate")
    @PreAuthorize("hasRole('ADMIN')")
    public StartupDto evaluate(@PathVariable Long id) {
        return applicationService.runEvaluation(id);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public StartupDto updateStatus(@PathVariable Long id, @RequestBody UpdateStatusRequest request) {
        return applicationService.updateStatus(id, request);
    }

    @GetMapping("/me/growth")
    public Map<String, Object> myGrowth(@AuthenticationPrincipal UserPrincipal principal) {
        return applicationService.getGrowthData(principal.getUser());
    }
}
