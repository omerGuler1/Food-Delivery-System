package com.hufds.service;

import com.hufds.dto.MessageDTO;
import com.hufds.entity.Message;
import com.hufds.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    
    /**
     * Yeni bir mesaj oluştur
     */
    @Transactional
    public MessageDTO createMessage(MessageDTO messageDTO) {
        Message message = messageDTO.toEntity();
        message.setCreatedAt(LocalDateTime.now());
        message.setIsRead(false);
        message = messageRepository.save(message);
        return MessageDTO.fromEntity(message);
    }
    
    /**
     * Bir kullanıcının gönderdiği tüm mesajları getir
     */
    @Transactional(readOnly = true)
    public List<MessageDTO> getSentMessages(Long userId) {
        return messageRepository.findSentMessagesByUserId(userId)
                .stream()
                .map(MessageDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Bir kullanıcının aldığı tüm mesajları getir
     * Eğer kullanıcı admin ise, sadece receiverType=ADMIN olan mesajları getir
     * Eğer kullanıcı restaurant ise, sadece receiverType=RESTAURANT olan mesajları getir
     */
    @Transactional(readOnly = true)
    public List<MessageDTO> getReceivedMessages(Long userId, String userType) {
        List<Message> messages;
        
        if ("ADMIN".equalsIgnoreCase(userType)) {
            // Admin kullanıcısı için özel sorgu
            messages = messageRepository.findAdminReceivedMessages(userId);
        } else if ("RESTAURANT".equalsIgnoreCase(userType)) {
            // Restaurant kullanıcısı için özel sorgu
            messages = messageRepository.findRestaurantReceivedMessages(userId);
        } else {
            // Diğer kullanıcılar için standart sorgu
            messages = messageRepository.findReceivedMessagesByUserId(userId);
        }
        
        return messages.stream()
                .map(MessageDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Bir kullanıcının okunmamış mesajlarını getir
     * Eğer kullanıcı admin ise, sadece receiverType=ADMIN olan mesajları getir
     * Eğer kullanıcı restaurant ise, sadece receiverType=RESTAURANT olan mesajları getir
     */
    @Transactional(readOnly = true)
    public List<MessageDTO> getUnreadMessages(Long userId, String userType) {
        List<Message> messages;
        
        if ("ADMIN".equalsIgnoreCase(userType)) {
            // Admin kullanıcısı için özel sorgu
            messages = messageRepository.findAdminUnreadMessages(userId);
        } else if ("RESTAURANT".equalsIgnoreCase(userType)) {
            // Restaurant kullanıcısı için özel sorgu
            messages = messageRepository.findRestaurantUnreadMessages(userId);
        } else {
            // Diğer kullanıcılar için standart sorgu
            messages = messageRepository.findUnreadMessagesByUserId(userId);
        }
        
        return messages.stream()
                .map(MessageDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Geriye uyumluluk için eski metot (userType belirtilmeden)
     */
    @Transactional(readOnly = true)
    public List<MessageDTO> getReceivedMessages(Long userId) {
        return getReceivedMessages(userId, "CUSTOMER"); // Varsayılan olarak CUSTOMER
    }
    
    /**
     * Geriye uyumluluk için eski metot (userType belirtilmeden)
     */
    @Transactional(readOnly = true)
    public List<MessageDTO> getUnreadMessages(Long userId) {
        return getUnreadMessages(userId, "CUSTOMER"); // Varsayılan olarak CUSTOMER
    }
    
    /**
     * Restaurant için özel olarak alınan mesajları getir
     */
    @Transactional(readOnly = true)
    public List<MessageDTO> getRestaurantReceivedMessages(Long restaurantId) {
        return messageRepository.findRestaurantReceivedMessages(restaurantId)
                .stream()
                .map(MessageDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Restaurant için özel olarak okunmamış mesajları getir
     */
    @Transactional(readOnly = true)
    public List<MessageDTO> getRestaurantUnreadMessages(Long restaurantId) {
        return messageRepository.findRestaurantUnreadMessages(restaurantId)
                .stream()
                .map(MessageDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Bir mesajı ID'ye göre getir
     */
    @Transactional(readOnly = true)
    public MessageDTO getMessageById(Long messageId) {
        return messageRepository.findById(messageId)
                .map(MessageDTO::fromEntity)
                .orElseThrow(() -> new RuntimeException("Message not found with ID: " + messageId));
    }
    
    /**
     * Bir mesajı okundu olarak işaretle
     */
    @Transactional
    public MessageDTO markAsRead(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found with ID: " + messageId));
        message.setIsRead(true);
        message = messageRepository.save(message);
        return MessageDTO.fromEntity(message);
    }
    
    /**
     * Bir mesajı sil (soft delete)
     */
    @Transactional
    public void deleteMessage(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found with ID: " + messageId));
        message.setDeletedAt(LocalDateTime.now());
        messageRepository.save(message);
    }
    
    /**
     * Kullanıcı tipine göre mesajları getir
     */
    @Transactional(readOnly = true)
    public List<MessageDTO> getMessagesByReceiverType(Message.UserType userType) {
        return messageRepository.findMessagesByReceiverType(userType)
                .stream()
                .map(MessageDTO::fromEntity)
                .collect(Collectors.toList());
    }
} 