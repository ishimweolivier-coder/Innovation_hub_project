package com.innovationhub.rw.repository;

import com.innovationhub.rw.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m JOIN FETCH m.sender WHERE m.conversation.id IN :conversationIds ORDER BY m.createdAt ASC")
    List<Message> findByConversationIdsWithSender(@Param("conversationIds") List<Long> conversationIds);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId")
    long countByConversationId(@Param("conversationId") Long conversationId);

    @Query("SELECT MIN(m.createdAt) FROM Message m WHERE m.conversation.id = :conversationId")
    java.time.LocalDateTime findFirstMessageAt(@Param("conversationId") Long conversationId);

    @Query("SELECT MAX(m.createdAt) FROM Message m WHERE m.conversation.id = :conversationId")
    java.time.LocalDateTime findLastMessageAt(@Param("conversationId") Long conversationId);
}
