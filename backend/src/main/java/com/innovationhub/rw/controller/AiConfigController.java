package com.innovationhub.rw.controller;

import com.innovationhub.rw.service.OpenAiEvaluationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiConfigController {

    private final OpenAiEvaluationService openAiEvaluationService;

    public AiConfigController(OpenAiEvaluationService openAiEvaluationService) {
        this.openAiEvaluationService = openAiEvaluationService;
    }

    @GetMapping("/status")
    public Map<String, Object> status() {
        boolean configured = openAiEvaluationService.isAvailable();
        return Map.of(
                "openAiConfigured", configured,
                "provider", configured ? "openai" : "automated-scoring",
                "model", configured ? openAiEvaluationService.getModelName() : "automated-scoring-1.0",
                "label", configured ? "AI Document Analysis (OpenAI)" : "Automated Scoring",
                "readsDocuments", true
        );
    }
}
