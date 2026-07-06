package com.innovationhub.rw.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "conversations")
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    private User participant;

    private String participantRoleLabel;
    private int unread = 0;
    private int participantUnread = 0;
    private boolean online = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "startup_id")
    private StartupApplication startup;

    private String communicationStatus;
    @Column(columnDefinition = "TEXT")
    private String journeyStatusComment;
    @Column(columnDefinition = "TEXT")
    private String aiCommunicationSummary;
    private boolean decisionDetected = false;
    private LocalDateTime lastAnalyzedAt;
    private int analyzedMessageCount = 0;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<Message> messages = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public User getParticipant() { return participant; }
    public void setParticipant(User participant) { this.participant = participant; }
    public String getParticipantRoleLabel() { return participantRoleLabel; }
    public void setParticipantRoleLabel(String participantRoleLabel) { this.participantRoleLabel = participantRoleLabel; }
    public int getUnread() { return unread; }
    public void setUnread(int unread) { this.unread = unread; }
    public int getParticipantUnread() { return participantUnread; }
    public void setParticipantUnread(int participantUnread) { this.participantUnread = participantUnread; }
    public boolean isOnline() { return online; }
    public void setOnline(boolean online) { this.online = online; }
    public StartupApplication getStartup() { return startup; }
    public void setStartup(StartupApplication startup) { this.startup = startup; }
    public String getCommunicationStatus() { return communicationStatus; }
    public void setCommunicationStatus(String communicationStatus) { this.communicationStatus = communicationStatus; }
    public String getJourneyStatusComment() { return journeyStatusComment; }
    public void setJourneyStatusComment(String journeyStatusComment) { this.journeyStatusComment = journeyStatusComment; }
    public String getAiCommunicationSummary() { return aiCommunicationSummary; }
    public void setAiCommunicationSummary(String aiCommunicationSummary) { this.aiCommunicationSummary = aiCommunicationSummary; }
    public boolean isDecisionDetected() { return decisionDetected; }
    public void setDecisionDetected(boolean decisionDetected) { this.decisionDetected = decisionDetected; }
    public LocalDateTime getLastAnalyzedAt() { return lastAnalyzedAt; }
    public void setLastAnalyzedAt(LocalDateTime lastAnalyzedAt) { this.lastAnalyzedAt = lastAnalyzedAt; }
    public int getAnalyzedMessageCount() { return analyzedMessageCount; }
    public void setAnalyzedMessageCount(int analyzedMessageCount) { this.analyzedMessageCount = analyzedMessageCount; }
    public List<Message> getMessages() { return messages; }
    public void setMessages(List<Message> messages) { this.messages = messages; }
}
