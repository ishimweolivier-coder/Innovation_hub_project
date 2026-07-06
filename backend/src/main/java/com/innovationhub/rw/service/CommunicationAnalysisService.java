package com.innovationhub.rw.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.innovationhub.rw.entity.*;
import com.innovationhub.rw.repository.InvestmentRepository;
import com.innovationhub.rw.repository.MessageRepository;
import com.innovationhub.rw.repository.ConversationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class CommunicationAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(CommunicationAnalysisService.class);
    private static final DateTimeFormatter DT = DateTimeFormatter.ofPattern("MMM d, yyyy");

    private final MessageRepository messageRepository;
    private final InvestmentRepository investmentRepository;
    private final ConversationRepository conversationRepository;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    @Value("${app.ai.openai.api-key:}")
    private String apiKey;

    @Value("${app.ai.openai.model:gpt-4o-mini}")
    private String model;

    @Value("${app.ai.openai.enabled:true}")
    private boolean enabled;

    public CommunicationAnalysisService(
            MessageRepository messageRepository,
            InvestmentRepository investmentRepository,
            ConversationRepository conversationRepository,
            ObjectMapper objectMapper
    ) {
        this.messageRepository = messageRepository;
        this.investmentRepository = investmentRepository;
        this.conversationRepository = conversationRepository;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().baseUrl("https://api.openai.com/v1").build();
    }

    public record CommunicationAnalysisResult(
            String communicationStatus,
            String statusComment,
            String aiSummary,
            boolean decisionDetected,
            String decisionSummary,
            String journeyStage
    ) {}

    public boolean isAiAvailable() {
        return enabled && apiKey != null && !apiKey.isBlank();
    }

    @Transactional
    public CommunicationAnalysisResult analyzeAndPersist(Conversation conversation) {
        if (conversation == null || conversation.getId() == null) return null;

        long messageCount = messageRepository.countByConversationId(conversation.getId());
        if (messageCount == 0 && conversation.getAnalyzedMessageCount() == 0) {
            return null;
        }

        if (messageCount == conversation.getAnalyzedMessageCount()
                && conversation.getJourneyStatusComment() != null
                && !conversation.getJourneyStatusComment().isBlank()) {
            return toResult(conversation);
        }

        List<Message> messages = messageRepository.findByConversationIdsWithSender(List.of(conversation.getId()));
        StartupApplication startup = conversation.getStartup();
        User founder = conversation.getUser();
        User investor = conversation.getParticipant();
        if (founder.getRole() == Role.INVESTOR || founder.getRole() == Role.ADMIN) {
            founder = conversation.getParticipant();
            investor = conversation.getUser();
        }
        if (investor.getRole() == Role.ENTREPRENEUR) {
            User tmp = founder;
            founder = investor;
            investor = tmp;
        }

        Optional<Investment> investment = startup != null
                ? investmentRepository.findByStartupAndInvestor(startup, investor)
                : Optional.empty();

        CommunicationAnalysisResult result = analyzeMessages(
                startup, founder, investor, messages, investment.orElse(null)
        );

        conversation.setCommunicationStatus(result.communicationStatus());
        conversation.setJourneyStatusComment(result.statusComment());
        conversation.setAiCommunicationSummary(result.aiSummary());
        conversation.setDecisionDetected(result.decisionDetected());
        conversation.setLastAnalyzedAt(LocalDateTime.now());
        conversation.setAnalyzedMessageCount((int) messageCount);
        conversationRepository.save(conversation);

        return result;
    }

    public CommunicationAnalysisResult analyzeMessages(
            StartupApplication startup,
            User founder,
            User investor,
            List<Message> messages,
            Investment investment
    ) {
        if (messages == null || messages.isEmpty()) {
            return rulesOnly(startup, investment, 0, true, null);
        }

        if (isAiAvailable()) {
            try {
                return analyzeWithOpenAi(startup, founder, investor, messages, investment);
            } catch (Exception e) {
                log.warn("OpenAI communication analysis failed: {} — using rules", e.getMessage());
            }
        }
        return analyzeWithRules(startup, founder, investor, messages, investment);
    }

    private CommunicationAnalysisResult analyzeWithOpenAi(
            StartupApplication startup,
            User founder,
            User investor,
            List<Message> messages,
            Investment investment
    ) {
        String thread = buildThreadText(founder, investor, messages);
        String investmentNote = investment != null
                ? "Platform investment: RWF " + String.format("%,d", investment.getAmount()) + " — " + investment.getStatus()
                : "No investment recorded on platform yet.";

        String prompt = """
            You analyze investor–entrepreneur messaging on Innovation Hub Rwanda to update the connection journey.
            Detect whether they are still discussing, agreed to invest/partner, funding is in progress, or deal is complete.
            
            Return ONLY valid JSON:
            {
              "communicationStatus": "Facilitation Matched|Communication Ongoing|Funding In Progress|Idea Acquired / Funding In Progress|Deal Completed",
              "decisionDetected": true or false,
              "decisionSummary": "short phrase if a decision was made, else empty",
              "statusComment": "1-2 sentences for admin report: state if communication ongoing, investor acquired stake/idea, facilitation matched, funding in progress",
              "journeyStage": "short stage label",
              "aiSummary": "1 sentence on what the messages indicate"
            }
            
            STARTUP: %s
            FOUNDER: %s
            INVESTOR: %s
            %s
            
            MESSAGE THREAD:
            %s
            """.formatted(
                startup != null ? startup.getName() : "Unknown startup",
                founder.getFullName(),
                investor.getFullName(),
                investmentNote,
                thread
        );

        String json = callOpenAi(prompt);
        try {
            JsonNode node = objectMapper.readTree(json);
            String status = node.path("communicationStatus").asText("Communication Ongoing");
            String comment = node.path("statusComment").asText("");
            String summary = node.path("aiSummary").asText("");
            boolean decision = node.path("decisionDetected").asBoolean(false);
            String decisionSummary = node.path("decisionSummary").asText("");
            String stage = node.path("journeyStage").asText(status);

            CommunicationAnalysisResult aiResult = new CommunicationAnalysisResult(
                    status, comment, summary, decision, decisionSummary, stage
            );
            return mergeWithInvestment(aiResult, startup, investment, messages.size());
        } catch (Exception e) {
            throw new IllegalStateException("Invalid communication AI JSON", e);
        }
    }

    private CommunicationAnalysisResult analyzeWithRules(
            StartupApplication startup,
            User founder,
            User investor,
            List<Message> messages,
            Investment investment
    ) {
        String combined = messages.stream()
                .map(m -> m.getText().toLowerCase())
                .reduce("", (a, b) -> a + " " + b);

        boolean decisionDetected = containsAny(combined,
                "agree", "deal", "invest", "partnership", "term sheet", "commit", "welcome aboard",
                "schedule a call", "let's proceed", "move forward", "funded", "confirmed"
        );
        boolean declined = containsAny(combined, "not interested", "pass on this", "decline", "unable to invest");
        boolean fundingTalk = containsAny(combined,
                "investment", "funding", "capital", "due diligence", "stake", "equity", "amount", "rwf"
        );

        String decisionSummary = "";
        if (declined) {
            decisionSummary = "Investor indicated they will not proceed";
        } else if (decisionDetected && fundingTalk) {
            decisionSummary = "Partnership or investment decision discussed in messages";
        } else if (decisionDetected) {
            decisionSummary = "Parties reached agreement to continue engagement";
        }

        String status;
        String comment;
        if (declined) {
            status = "Communication Ongoing";
            comment = "Communication recorded — investor expressed reservations. Facilitation matched; funding outcome pending.";
        } else if (investment != null && "Active".equals(investment.getStatus())) {
            status = isFullyFunded(startup) ? "Deal Completed" : "Idea Acquired / Funding In Progress";
            comment = "AI detected messaging activity — investor acquired stake in " +
                    (startup != null ? startup.getName() : "startup") +
                    ". Facilitation matched; funding in progress.";
        } else if (investment != null && "Pending".equals(investment.getStatus())) {
            status = "Funding In Progress";
            comment = decisionDetected
                    ? "Communication analysis: parties made investment decision — commitment pending on platform. Facilitation matched; funding in progress."
                    : "Communication still ongoing — investment pending approval. Facilitation matched; funding in progress.";
        } else if (decisionDetected && fundingTalk) {
            status = "Funding In Progress";
            comment = "Communication analysis detected funding discussions and mutual decision — facilitation matched; funding in progress.";
        } else if (messages.size() > 0) {
            status = "Communication Ongoing";
            comment = "Communication still ongoing between " + founder.getFullName() + " and " + investor.getFullName() +
                    " (" + messages.size() + " messages). AI facilitation match confirmed; funding in progress.";
        } else {
            return rulesOnly(startup, investment, 0, false, null);
        }

        String summary = "Automated analysis of " + messages.size() + " message(s)"
                + (decisionSummary.isBlank() ? "." : ": " + decisionSummary + ".");

        return new CommunicationAnalysisResult(status, comment, summary, decisionDetected, decisionSummary, status);
    }

    private CommunicationAnalysisResult mergeWithInvestment(
            CommunicationAnalysisResult ai,
            StartupApplication startup,
            Investment investment,
            int messageCount
    ) {
        if (investment == null) return ai;

        if ("Active".equals(investment.getStatus()) && isFullyFunded(startup)) {
            return new CommunicationAnalysisResult(
                    "Deal Completed",
                    "AI confirmed communication journey — startup fully funded. Investor partnership secured through Innovation Hub facilitation.",
                    ai.aiSummary(),
                    true,
                    "Deal completed — funding goal reached",
                    "Deal Completed"
            );
        }
        if ("Active".equals(investment.getStatus())) {
            return new CommunicationAnalysisResult(
                    "Idea Acquired / Funding In Progress",
                    ai.statusComment().isBlank()
                            ? "AI detected investor acquired stake — facilitation matched; funding in progress."
                            : ai.statusComment(),
                    ai.aiSummary(),
                    true,
                    ai.decisionSummary().isBlank() ? "Investment active on platform" : ai.decisionSummary(),
                    "Idea Acquired / Funding In Progress"
            );
        }
        if ("Pending".equals(investment.getStatus())) {
            String comment = ai.decisionDetected()
                    ? "AI detected partnership decision in messages — investment commitment submitted. Facilitation matched; funding in progress."
                    : ai.statusComment();
            return new CommunicationAnalysisResult(
                    "Funding In Progress",
                    comment,
                    ai.aiSummary(),
                    ai.decisionDetected(),
                    ai.decisionSummary(),
                    "Funding In Progress"
            );
        }
        return ai;
    }

    private CommunicationAnalysisResult rulesOnly(
            StartupApplication startup,
            Investment investment,
            int messageCount,
            boolean aiMatched,
            Boolean hasInterest
    ) {
        if (investment != null && "Active".equals(investment.getStatus())) {
            boolean funded = isFullyFunded(startup);
            return new CommunicationAnalysisResult(
                    funded ? "Deal Completed" : "Idea Acquired / Funding In Progress",
                    funded
                            ? "Startup funded — investor partnership secured through platform facilitation."
                            : "Investor acquired stake — facilitation matched; funding in progress.",
                    "Investment recorded on platform.",
                    true,
                    "Active investment",
                    funded ? "Deal Completed" : "Idea Acquired / Funding In Progress"
            );
        }
        if (investment != null && "Pending".equals(investment.getStatus())) {
            return new CommunicationAnalysisResult(
                    "Funding In Progress",
                    "Investment commitment pending — facilitation matched; funding in progress.",
                    "Pending investment on platform.",
                    false,
                    "",
                    "Funding In Progress"
            );
        }
        if (Boolean.TRUE.equals(hasInterest)) {
            return new CommunicationAnalysisResult(
                    "Facilitation Matched",
                    "Facilitation matched — investor interest recorded. Awaiting communication.",
                    "",
                    false,
                    "",
                    "Facilitation Matched"
            );
        }
        return new CommunicationAnalysisResult(
                "Facilitation Matched",
                "Platform connection recorded.",
                "",
                false,
                "",
                "Facilitation Matched"
        );
    }

    private String buildThreadText(User founder, User investor, List<Message> messages) {
        StringBuilder sb = new StringBuilder();
        for (Message m : messages) {
            String role = m.getSender().getId().equals(founder.getId()) ? "Entrepreneur" : "Investor";
            if (m.getSender().getRole() == Role.ADMIN) role = "Admin";
            sb.append("[").append(role).append(" ").append(m.getCreatedAt().format(DT)).append("]: ")
                    .append(m.getText()).append("\n");
        }
        return sb.toString();
    }

    private String callOpenAi(String prompt) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        body.put("temperature", 0.2);
        body.put("response_format", Map.of("type", "json_object"));
        body.put("messages", List.of(
                Map.of("role", "system", "content", "You analyze startup investor messaging for Rwanda Innovation Hub. JSON only."),
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

    private boolean isFullyFunded(StartupApplication startup) {
        if (startup == null) return false;
        if ("Funded".equals(startup.getStatus()) || "Graduated".equals(startup.getStatus())) return true;
        Long goal = startup.getFundingGoal();
        Long raised = startup.getFundingRaised();
        return goal != null && goal > 0 && raised != null && raised >= goal;
    }

    private boolean containsAny(String text, String... keywords) {
        for (String k : keywords) {
            if (text.contains(k)) return true;
        }
        return false;
    }

    private CommunicationAnalysisResult toResult(Conversation c) {
        return new CommunicationAnalysisResult(
                c.getCommunicationStatus(),
                c.getJourneyStatusComment(),
                c.getAiCommunicationSummary(),
                c.isDecisionDetected(),
                c.isDecisionDetected() ? "Previously detected decision" : "",
                c.getCommunicationStatus()
        );
    }
}
