package com.innovationhub.rw.repository;

import com.innovationhub.rw.entity.Conversation;
import com.innovationhub.rw.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT DISTINCT c FROM Conversation c JOIN FETCH c.user JOIN FETCH c.participant WHERE c.user.id = :userId OR c.participant.id = :userId ORDER BY c.id DESC")
    List<Conversation> findForUser(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c WHERE (c.user = :a AND c.participant = :b) OR (c.user = :b AND c.participant = :a)")
    Optional<Conversation> findBetweenUsers(@Param("a") User a, @Param("b") User b);

    Optional<Conversation> findByUserAndParticipant(User user, User participant);

    @Query("SELECT c FROM Conversation c WHERE c.user.id = :userId OR c.participant.id = :userId")
    List<Conversation> findByUserIdOrParticipantId(@Param("userId") Long userId);
}
