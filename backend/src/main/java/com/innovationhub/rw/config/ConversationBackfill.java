package com.innovationhub.rw.config;

import com.innovationhub.rw.entity.Conversation;
import com.innovationhub.rw.entity.Message;
import com.innovationhub.rw.entity.User;
import com.innovationhub.rw.repository.ConversationRepository;
import com.innovationhub.rw.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
public class ConversationBackfill implements ApplicationRunner {

    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;

    public ConversationBackfill(UserRepository userRepository, ConversationRepository conversationRepository) {
        this.userRepository = userRepository;
        this.conversationRepository = conversationRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Optional<User> admin = userRepository.findByEmail("admin@innovationhub.rw");
        Optional<User> entrepreneur = userRepository.findByEmail("jean@startup.rw");
        Optional<User> investor = userRepository.findByEmail("sarah@invest.rw");

        if (admin.isEmpty()) return;

        if (entrepreneur.isPresent()) {
            ensureAdminConversation(
                    admin.get(),
                    entrepreneur.get(),
                    "Entrepreneur · AgriSmart Rwanda",
                    entrepreneur.get(),
                    "Hi Admin, I have a question about my funding application status.",
                    admin.get(),
                    "Hello Jean, I'll review your file and get back to you shortly."
            );
        }

        if (investor.isPresent()) {
            ensureAdminConversation(
                    admin.get(),
                    investor.get(),
                    "Investor · Kigali Ventures",
                    investor.get(),
                    "I'd like to discuss co-investment opportunities on the platform.",
                    admin.get(),
                    "Thank you Sarah, let's schedule a briefing call this week."
            );
        }
    }

    private void ensureAdminConversation(
            User admin,
            User other,
            String roleLabel,
            User firstSender,
            String firstText,
            User secondSender,
            String secondText
    ) {
        if (conversationRepository.findBetweenUsers(admin, other).isPresent()) return;

        Conversation c = new Conversation();
        c.setUser(admin);
        c.setParticipant(other);
        c.setParticipantRoleLabel(roleLabel);
        c.setOnline(true);
        c.setUnread(0);
        conversationRepository.save(c);

        addMessage(c, firstSender, firstText, LocalDateTime.now().minusHours(5));
        addMessage(c, secondSender, secondText, LocalDateTime.now().minusHours(3));
    }

    private void addMessage(Conversation conversation, User sender, String text, LocalDateTime time) {
        Message m = new Message();
        m.setConversation(conversation);
        m.setSender(sender);
        m.setText(text);
        m.setCreatedAt(time);
        conversation.getMessages().add(m);
        conversationRepository.save(conversation);
    }
}
