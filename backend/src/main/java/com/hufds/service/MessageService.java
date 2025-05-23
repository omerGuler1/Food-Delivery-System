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
     * Eğer kullanıcı courier ise, sadece receiverType=COURIER olan mesajları getir
     * Eğer kullanıcı customer ise, sadece receiverType=CUSTOMER olan mesajları getir
     */
    @Transactional(readOnly = true)
    public List<MessageDTO> getReceivedMessages(Long userId, String userType) {
        List<Message> messages;
        
        System.out.println("getReceivedMessages called with userId: " + userId + ", userType: " + userType);
        
        if ("ADMIN".equalsIgnoreCase(userType)) {
            // Admin kullanıcısı için özel sorgu
            messages = messageRepository.findAdminReceivedMessages(userId);
            System.out.println("Admin messages found: " + messages.size());
        } else if ("RESTAURANT".equalsIgnoreCase(userType)) {
            // Restaurant kullanıcısı için özel sorgu
            messages = messageRepository.findRestaurantReceivedMessages(userId);
            System.out.println("Restaurant messages found: " + messages.size());
        } else if ("COURIER".equalsIgnoreCase(userType)) {
            // Courier kullanıcısı için özel sorgu
            messages = messageRepository.findCourierReceivedMessages(userId);
            System.out.println("Courier messages found: " + messages.size());
        } else if ("CUSTOMER".equalsIgnoreCase(userType)) {
            // Customer kullanıcısı için özel sorgu
            messages = messageRepository.findCustomerReceivedMessages(userId);
            System.out.println("Customer messages found: " + messages.size());
        } else {
            // Diğer kullanıcılar için standart sorgu
            messages = messageRepository.findReceivedMessagesByUserId(userId);
            System.out.println("Standard messages found: " + messages.size());
        }
        
        return messages.stream()
                .map(MessageDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Bir kullanıcının okunmamış mesajlarını getir
     * Eğer kullanıcı admin ise, sadece receiverType=ADMIN olan mesajları getir
     * Eğer kullanıcı restaurant ise, sadece receiverType=RESTAURANT olan mesajları getir
     * Eğer kullanıcı courier ise, sadece receiverType=COURIER olan mesajları getir
     * Eğer kullanıcı customer ise, sadece receiverType=CUSTOMER olan mesajları getir
     */
    @Transactional(readOnly = true)
    public List<MessageDTO> getUnreadMessages(Long userId, String userType) {
        List<Message> messages;
        
        System.out.println("getUnreadMessages called with userId: " + userId + ", userType: " + userType);
        
        if ("ADMIN".equalsIgnoreCase(userType)) {
            // Admin kullanıcısı için özel sorgu
            messages = messageRepository.findAdminUnreadMessages(userId);
            System.out.println("Admin unread messages found: " + messages.size());
        } else if ("RESTAURANT".equalsIgnoreCase(userType)) {
            // Restaurant kullanıcısı için özel sorgu
            messages = messageRepository.findRestaurantUnreadMessages(userId);
            System.out.println("Restaurant unread messages found: " + messages.size());
        } else if ("COURIER".equalsIgnoreCase(userType)) {
            // Courier kullanıcısı için özel sorgu
            messages = messageRepository.findCourierUnreadMessages(userId);
            System.out.println("Courier unread messages found: " + messages.size());
        } else if ("CUSTOMER".equalsIgnoreCase(userType)) {
            // Customer kullanıcısı için özel sorgu
            messages = messageRepository.findCustomerUnreadMessages(userId);
            System.out.println("Customer unread messages found: " + messages.size());
        } else {
            // Diğer kullanıcılar için standart sorgu
            messages = messageRepository.findUnreadMessagesByUserId(userId);
            System.out.println("Standard unread messages found: " + messages.size());
        }
        
        return messages.stream()
                .map(MessageDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Geriye uyumluluk için eski metot (userType belirtilmeden)
     * Filtreleme olmadan tüm mesajları döndürür
     */
    @Transactional(readOnly = true)
    public List<MessageDTO> getReceivedMessages(Long userId) {
        System.out.println("getReceivedMessages (no filter) called with userId: " + userId);
        List<Message> messages = messageRepository.findReceivedMessagesByUserId(userId);
        System.out.println("All messages (no filter) found: " + messages.size());
        return messages.stream()
                .map(MessageDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Geriye uyumluluk için eski metot (userType belirtilmeden)
     * Filtreleme olmadan tüm okunmamış mesajları döndürür
     */
    @Transactional(readOnly = true)
    public List<MessageDTO> getUnreadMessages(Long userId) {
        System.out.println("getUnreadMessages (no filter) called with userId: " + userId);
        List<Message> messages = messageRepository.findUnreadMessagesByUserId(userId);
        System.out.println("All unread messages (no filter) found: " + messages.size());
        return messages.stream()
                .map(MessageDTO::fromEntity)
                .collect(Collectors.toList());
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
     * Courier için özel olarak alınan mesajları getir
     */
    @Transactional(readOnly = true)
    public List<MessageDTO> getCourierReceivedMessages(Long courierId) {
        return messageRepository.findCourierReceivedMessages(courierId)
                .stream()
                .map(MessageDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Courier için özel olarak okunmamış mesajları getir
     */
    @Transactional(readOnly = true)
    public List<MessageDTO> getCourierUnreadMessages(Long courierId) {
        return messageRepository.findCourierUnreadMessages(courierId)
                .stream()
                .map(MessageDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Customer için özel olarak alınan mesajları getir
     */
    @Transactional(readOnly = true)
    public List<MessageDTO> getCustomerReceivedMessages(Long customerId) {
        System.out.println("getCustomerReceivedMessages called with customerId: " + customerId);
        List<Message> messages = messageRepository.findCustomerReceivedMessages(customerId);
        System.out.println("Customer specific messages found: " + messages.size());
        return messages.stream()
                .map(MessageDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Customer için özel olarak okunmamış mesajları getir
     */
    @Transactional(readOnly = true)
    public List<MessageDTO> getCustomerUnreadMessages(Long customerId) {
        System.out.println("getCustomerUnreadMessages called with customerId: " + customerId);
        List<Message> messages = messageRepository.findCustomerUnreadMessages(customerId);
        System.out.println("Customer specific unread messages found: " + messages.size());
        return messages.stream()
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