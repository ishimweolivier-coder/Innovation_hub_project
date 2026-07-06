package com.innovationhub.rw.controller;

import com.innovationhub.rw.dto.FounderContactDto;
import com.innovationhub.rw.entity.*;
import com.innovationhub.rw.repository.ConversationRepository;
import com.innovationhub.rw.repository.MessageRepository;
import com.innovationhub.rw.repository.NotificationRepository;
import com.innovationhub.rw.repository.StartupApplicationRepository;
import com.innovationhub.rw.repository.StartupInterestRepository;
import com.innovationhub.rw.security.UserPrincipal;
import com.innovationhub.rw.service.CommunicationAnalysisService;
import jakarta.transaction.Transactional;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final NotificationRepository notificationRepository;
    private final StartupApplicationRepository applicationRepository;
    private final StartupInterestRepository interestRepository;
    private final CommunicationAnalysisService communicationAnalysisService;

    public ConversationController(
            ConversationRepository conversationRepository,
            MessageRepository messageRepository,
            NotificationRepository notificationRepository,
            StartupApplicationRepository applicationRepository,
            StartupInterestRepository interestRepository,
            CommunicationAnalysisService communicationAnalysisService
    ) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.notificationRepository = notificationRepository;
        this.applicationRepository = applicationRepository;
        this.interestRepository = interestRepository;
        this.communicationAnalysisService = communicationAnalysisService;
    }

    @GetMapping
    @Transactional
    public List<Map<String, Object>> list(@AuthenticationPrincipal UserPrincipal principal) {
        List<Conversation> conversations = conversationRepository.findForUser(principal.getUser().getId());
        if (conversations.isEmpty()) {
            return List.of();
        }

        List<Long> ids = conversations.stream().map(Conversation::getId).toList();
        Map<Long, List<Message>> messagesByConversation = messageRepository
                .findByConversationIdsWithSender(ids)
                .stream()
                .collect(Collectors.groupingBy(m -> m.getConversation().getId()));

        return conversations.stream()
                .map(c -> toConversationDto(c, principal.getUser(), messagesByConversation.getOrDefault(c.getId(), List.of())))
                .toList();
    }

    @PostMapping("/{id}/messages")
    @Transactional
    public Map<String, Object> sendMessage(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, String> body
    ) {
        String text = body.get("text");
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Message text is required");
        }

        Conversation conversation = conversationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        assertCanAccess(principal.getUser(), conversation);

        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(principal.getUser());
        message.setText(text.trim());
        messageRepository.save(message);

        if (conversation.getUser().getId().equals(principal.getUser().getId())) {
            conversation.setUnread(0);
            conversation.setParticipantUnread(conversation.getParticipantUnread() + 1);
        } else {
            conversation.setParticipantUnread(0);
            conversation.setUnread(conversation.getUnread() + 1);
        }

        conversationRepository.save(conversation);

        communicationAnalysisService.analyzeAndPersist(conversation);

        return Map.of(
                "id", message.getId(),
                "sender", "me",
                "text", message.getText(),
                "time", message.getCreatedAt().format(DateTimeFormatter.ofPattern("h:mm a"))
        );
    }

    @PatchMapping("/{id}/read")
    @Transactional
    public void markRead(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        Conversation c = conversationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        assertCanAccess(principal.getUser(), c);
        if (c.getUser().getId().equals(principal.getUser().getId())) {
            c.setUnread(0);
        } else {
            c.setParticipantUnread(0);
        }
        conversationRepository.save(c);
    }

    @PostMapping("/interest")
    @Transactional
    @PreAuthorize("hasRole('INVESTOR')")
    public Map<String, Object> expressInterest(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Long> body
    ) {
        Long startupId = body.get("startupId");
        if (startupId == null) {
            throw new IllegalArgumentException("startupId is required");
        }

        StartupApplication startup = applicationRepository.findByIdWithDetails(startupId)
                .orElseThrow(() -> new IllegalArgumentException("Startup not found"));

        User founder = startup.getFounder();
        User investor = principal.getUser();

        boolean alreadyInterested = interestRepository.existsByStartupIdAndInvestorId(startupId, investor.getId());

        Conversation conversation = conversationRepository.findBetweenUsers(founder, investor)
                .orElseGet(() -> {
                    Conversation c = new Conversation();
                    c.setUser(founder);
                    c.setParticipant(investor);
                    c.setStartup(startup);
                    c.setParticipantRoleLabel(buildRoleLabel(investor));
                    c.setOnline(true);
                    return conversationRepository.save(c);
                });

        if (conversation.getStartup() == null) {
            conversation.setStartup(startup);
            conversationRepository.save(conversation);
        }

        if (!alreadyInterested) {
            StartupInterest interest = new StartupInterest();
            interest.setStartup(startup);
            interest.setInvestor(investor);
            interestRepository.save(interest);

            Notification notification = new Notification();
            notification.setUser(founder);
            notification.setMessage("Investor " + investor.getFullName() + " expressed interest in " + startup.getName() + ".");
            notification.setType("interest");
            notificationRepository.save(notification);

            Message message = new Message();
            message.setConversation(conversation);
            message.setSender(investor);
            message.setText("I expressed interest in " + startup.getName() + ". I'd love to learn more about your startup.");
            messageRepository.save(message);
            conversation.setUnread(conversation.getUnread() + 1);
            conversationRepository.save(conversation);
        }

        communicationAnalysisService.analyzeAndPersist(conversation);

        FounderContactDto contact = FounderContactDto.from(founder, startup.getName());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("message", alreadyInterested ? "You already expressed interest in this startup." : "Interest expressed successfully");
        result.put("conversationId", conversation.getId());
        result.put("founderContact", Map.of(
                "fullName", contact.fullName(),
                "email", contact.email(),
                "phone", contact.phone() != null ? contact.phone() : "",
                "company", contact.company() != null ? contact.company() : "",
                "startupName", contact.startupName()
        ));
        return result;
    }

    private void assertCanAccess(User user, Conversation conversation) {
        if (!conversation.getUser().getId().equals(user.getId())
                && !conversation.getParticipant().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Access denied");
        }
    }

    private Map<String, Object> toConversationDto(Conversation c, User currentUser, List<Message> messages) {
        boolean ownerView = c.getUser().getId().equals(currentUser.getId());
        User other = ownerView ? c.getParticipant() : c.getUser();
        String roleLabel = ownerView ? c.getParticipantRoleLabel() : buildRoleLabel(other);

        String lastMessage = messages.isEmpty() ? "" : messages.get(messages.size() - 1).getText();
        String lastTime = messages.isEmpty() ? ""
                : messages.get(messages.size() - 1).getCreatedAt().format(DateTimeFormatter.ofPattern("h:mm a"));

        List<Map<String, Object>> messageDtos = messages.stream()
                .map(m -> Map.<String, Object>of(
                        "id", m.getId(),
                        "sender", m.getSender().getId().equals(currentUser.getId()) ? "me" : "them",
                        "text", m.getText(),
                        "time", m.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM d h:mm a"))
                ))
                .toList();

        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", c.getId());
        dto.put("name", other.getFullName());
        dto.put("role", roleLabel != null ? roleLabel : buildRoleLabel(other));
        dto.put("avatar", other.getAvatar());
        dto.put("lastMessage", lastMessage);
        dto.put("time", lastTime);
        dto.put("unread", ownerView ? c.getUnread() : c.getParticipantUnread());
        dto.put("online", c.isOnline());
        dto.put("contactEmail", other.getEmail());
        dto.put("contactPhone", other.getPhone() != null && !other.getPhone().isBlank() ? other.getPhone() : null);
        dto.put("contactCompany", other.getCompany());
        dto.put("messages", messageDtos);
        return dto;
    }

    private String buildRoleLabel(User user) {
        if (user.getRole() == Role.ADMIN) return "Innovation Hub Team";
        if (user.getRole() == Role.INVESTOR) {
            return "Investor · " + (user.getCompany() != null ? user.getCompany() : user.getFullName());
        }
        if (user.getRole() == Role.ENTREPRENEUR) return "Entrepreneur";
        return user.getRole().name();
    }
}
