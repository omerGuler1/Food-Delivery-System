package com.hufds.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "message")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long messageId;
    
    @Column(name = "sender_id", nullable = false)
    private Long senderId;
    
    @Column(name = "receiver_id", nullable = false)
    private Long receiverId;
    
    @Column(name = "sender_name", nullable = false, length = 100)
    private String senderName;
    
    @Column(name = "receiver_name", nullable = false, length = 100)
    private String receiverName;
    
    @Column(name = "sender_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private UserType senderType;
    
    @Column(name = "receiver_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private UserType receiverType;
    
    @Column(name = "message_content", nullable = false, columnDefinition = "TEXT")
    private String messageContent;
    
    @Column(name = "message_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private MessageType messageType;
    
    @Column(name = "is_read", nullable = false)
    private Boolean isRead;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        isRead = false;
    }
    
    public enum UserType {
        CUSTOMER, ADMIN, RESTAURANT, COURIER
    }
    
    public enum MessageType {
        REQUEST, SUGGESTION, COMPLAINT, WARNING
    }
} 