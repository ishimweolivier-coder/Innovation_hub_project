package com.innovationhub.rw.controller;

import com.innovationhub.rw.dto.CreateInvestmentRequest;
import com.innovationhub.rw.service.InvestmentService;
import com.innovationhub.rw.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/investments")
public class InvestmentController {

    private final InvestmentService investmentService;

    public InvestmentController(InvestmentService investmentService) {
        this.investmentService = investmentService;
    }

    @GetMapping
    public List<Map<String, Object>> list(@AuthenticationPrincipal UserPrincipal principal) {
        return investmentService.listForUser(principal.getUser());
    }

    @PostMapping
    public Map<String, Object> create(
            @Valid @RequestBody CreateInvestmentRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return investmentService.create(request, principal.getUser());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return investmentService.updateStatus(id, body.get("status"));
    }
}
