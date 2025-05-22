package com.hufds.controller;

import com.hufds.dto.MessageDTO;
import com.hufds.entity.Message;
import com.hufds.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class MessageController {

    private final MessageService messageService;
    
    /**
     * Yeni bir mesaj oluştur
     */
    @PostMapping
    public ResponseEntity<MessageDTO> createMessage(@RequestBody MessageDTO messageDTO) {
        MessageDTO createdMessage = messageService.createMessage(messageDTO);
        return new ResponseEntity<>(createdMessage, HttpStatus.CREATED);
    }
    
    /**
     * Bir kullanıcının gönderdiği tüm mesajları getir
     */
    @GetMapping("/sent/{userId}")
    public ResponseEntity<List<MessageDTO>> getSentMessages(@PathVariable Long userId) {
        List<MessageDTO> messages = messageService.getSentMessages(userId);
        return ResponseEntity.ok(messages);
    }
    
    /**
     * Bir kullanıcının aldığı tüm mesajları getir
     */
    @GetMapping("/received/{userId}")
    public ResponseEntity<List<MessageDTO>> getReceivedMessages(@PathVariable Long userId) {
        List<MessageDTO> messages = messageService.getReceivedMessages(userId);
        return ResponseEntity.ok(messages);
    }
    
    /**
     * Kullanıcı tipi ile bir kullanıcının aldığı tüm mesajları getir
     */
    @GetMapping("/received/{userId}/{userType}")
    public ResponseEntity<List<MessageDTO>> getReceivedMessagesByType(
            @PathVariable Long userId,
            @PathVariable String userType) {
        List<MessageDTO> messages = messageService.getReceivedMessages(userId, userType);
        return ResponseEntity.ok(messages);
    }
    
    /**
     * Admin için özel olarak mesajları getir (sadece receiverType=ADMIN olanlar)
     */
    @GetMapping("/admin/received/{adminId}")
    public ResponseEntity<List<MessageDTO>> getAdminReceivedMessages(@PathVariable Long adminId) {
        List<MessageDTO> messages = messageService.getReceivedMessages(adminId, "ADMIN");
        return ResponseEntity.ok(messages);
    }
    
    /**
     * Restaurant için özel olarak mesajları getir (sadece receiverType=RESTAURANT olanlar)
     */
    @GetMapping("/restaurant/received/{restaurantId}")
    public ResponseEntity<List<MessageDTO>> getRestaurantReceivedMessages(@PathVariable Long restaurantId) {
        List<MessageDTO> messages = messageService.getReceivedMessages(restaurantId, "RESTAURANT");
        return ResponseEntity.ok(messages);
    }
    
    /**
     * Bir kullanıcının okunmamış mesajlarını getir
     */
    @GetMapping("/unread/{userId}")
    public ResponseEntity<List<MessageDTO>> getUnreadMessages(@PathVariable Long userId) {
        List<MessageDTO> messages = messageService.getUnreadMessages(userId);
        return ResponseEntity.ok(messages);
    }
    
    /**
     * Kullanıcı tipi ile bir kullanıcının okunmamış mesajlarını getir
     */
    @GetMapping("/unread/{userId}/{userType}")
    public ResponseEntity<List<MessageDTO>> getUnreadMessagesByType(
            @PathVariable Long userId,
            @PathVariable String userType) {
        List<MessageDTO> messages = messageService.getUnreadMessages(userId, userType);
        return ResponseEntity.ok(messages);
    }
    
    /**
     * Admin için özel olarak okunmamış mesajları getir (sadece receiverType=ADMIN olanlar)
     */
    @GetMapping("/admin/unread/{adminId}")
    public ResponseEntity<List<MessageDTO>> getAdminUnreadMessages(@PathVariable Long adminId) {
        List<MessageDTO> messages = messageService.getUnreadMessages(adminId, "ADMIN");
        return ResponseEntity.ok(messages);
    }
    
    /**
     * Restaurant için özel olarak okunmamış mesajları getir (sadece receiverType=RESTAURANT olanlar)
     */
    @GetMapping("/restaurant/unread/{restaurantId}")
    public ResponseEntity<List<MessageDTO>> getRestaurantUnreadMessages(@PathVariable Long restaurantId) {
        List<MessageDTO> messages = messageService.getUnreadMessages(restaurantId, "RESTAURANT");
        return ResponseEntity.ok(messages);
    }
    
    /**
     * Bir mesajı ID'ye göre getir
     */
    @GetMapping("/{messageId}")
    public ResponseEntity<MessageDTO> getMessageById(@PathVariable Long messageId) {
        MessageDTO message = messageService.getMessageById(messageId);
        return ResponseEntity.ok(message);
    }
    
    /**
     * Bir mesajı okundu olarak işaretle
     */
    @PutMapping("/{messageId}/read")
    public ResponseEntity<MessageDTO> markAsRead(@PathVariable Long messageId) {
        MessageDTO message = messageService.markAsRead(messageId);
        return ResponseEntity.ok(message);
    }
    
    /**
     * Bir mesajı sil (soft delete)
     */
    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long messageId) {
        messageService.deleteMessage(messageId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Kullanıcı tipine göre mesajları getir
     */
    @GetMapping("/by-type/{userType}")
    public ResponseEntity<List<MessageDTO>> getMessagesByReceiverType(@PathVariable String userType) {
        try {
            Message.UserType type = Message.UserType.valueOf(userType.toUpperCase());
            List<MessageDTO> messages = messageService.getMessagesByReceiverType(type);
            return ResponseEntity.ok(messages);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 