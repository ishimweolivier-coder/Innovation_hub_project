package com.innovationhub.rw.controller;

import com.innovationhub.rw.entity.Role;
import com.innovationhub.rw.entity.StartupApplication;
import com.innovationhub.rw.entity.User;
import com.innovationhub.rw.repository.StartupApplicationRepository;
import com.innovationhub.rw.security.UserPrincipal;
import com.innovationhub.rw.service.DocumentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/applications")
public class ApplicationDocumentController {

    private final StartupApplicationRepository applicationRepository;
    private final DocumentService documentService;

    public ApplicationDocumentController(
            StartupApplicationRepository applicationRepository,
            DocumentService documentService
    ) {
        this.applicationRepository = applicationRepository;
        this.documentService = documentService;
    }

    @GetMapping("/{id}/documents/{type}")
    public ResponseEntity<Resource> viewDocument(
            @PathVariable Long id,
            @PathVariable String type,
            @AuthenticationPrincipal UserPrincipal principal
    ) throws IOException {
        if (!"business-plan".equals(type) && !"budget".equals(type)) {
            throw new IllegalArgumentException("Invalid document type");
        }

        StartupApplication app = applicationRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        assertCanView(principal.getUser(), app);

        Resource resource = documentService.getDocument(app, type);
        String contentType = documentService.getContentType(app, type);
        String filename = documentService.getFilename(app, type);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }

    private void assertCanView(User user, StartupApplication app) {
        if (user.getRole() == Role.ADMIN) return;
        if (user.getRole() == Role.ENTREPRENEUR && app.getFounder().getId().equals(user.getId())) return;
        if (user.getRole() == Role.INVESTOR && app.getAiAssessment() != null) return;
        throw new IllegalArgumentException("Access denied");
    }
}
