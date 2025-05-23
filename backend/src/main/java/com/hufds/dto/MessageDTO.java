package com.hufds.dto;

import com.hufds.entity.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private Long messageId;
    private Long senderId;
    private Long receiverId;
    private String senderName;
    private String receiverName;
    private Message.UserType senderType;
    private Message.UserType receiverType;
    private String messageContent;
    private Message.MessageType messageType;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime deletedAt;
    
    // Entity'den DTO'ya dönüşüm
    public static MessageDTO fromEntity(Message message) {
        return MessageDTO.builder()
                .messageId(message.getMessageId())
                .senderId(message.getSenderId())
                .receiverId(message.getReceiverId())
                .senderName(message.getSenderName())
                .receiverName(message.getReceiverName())
                .senderType(message.getSenderType())
                .receiverType(message.getReceiverType())
                .messageContent(message.getMessageContent())
                .messageType(message.getMessageType())
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .deletedAt(message.getDeletedAt())
                .build();
    }
    
    // DTO'dan Entity'ye dönüşüm
    public Message toEntity() {
        return Message.builder()
                .messageId(this.messageId)
                .senderId(this.senderId)
                .receiverId(this.receiverId)
                .senderName(this.senderName)
                .receiverName(this.receiverName)
                .senderType(this.senderType)
                .receiverType(this.receiverType)
                .messageContent(this.messageContent)
                .messageType(this.messageType)
                .isRead(this.isRead)
                .createdAt(this.createdAt != null ? this.createdAt : LocalDateTime.now())
                .deletedAt(this.deletedAt)
                .build();
    }
} 