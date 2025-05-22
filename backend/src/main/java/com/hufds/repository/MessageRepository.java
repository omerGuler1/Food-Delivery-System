package com.hufds.repository;

import com.hufds.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    // Kullanıcının gönderdiği ve silinmemiş mesajları getir
    @Query("SELECT m FROM Message m WHERE m.senderId = :userId AND m.deletedAt IS NULL ORDER BY m.createdAt DESC")
    List<Message> findSentMessagesByUserId(@Param("userId") Long userId);
    
    // Kullanıcının aldığı ve silinmemiş mesajları getir
    @Query("SELECT m FROM Message m WHERE m.receiverId = :userId AND m.deletedAt IS NULL ORDER BY m.createdAt DESC")
    List<Message> findReceivedMessagesByUserId(@Param("userId") Long userId);
    
    // Admin için özel olarak alınan mesajları getir (sadece receiverType ADMIN olanlar)
    @Query("SELECT m FROM Message m WHERE m.receiverId = :adminId AND m.receiverType = 'ADMIN' AND m.deletedAt IS NULL ORDER BY m.createdAt DESC")
    List<Message> findAdminReceivedMessages(@Param("adminId") Long adminId);

    // Restaurant için özel olarak alınan mesajları getir (sadece receiverType RESTAURANT olanlar)
    @Query("SELECT m FROM Message m WHERE m.receiverId = :restaurantId AND m.receiverType = 'RESTAURANT' AND m.deletedAt IS NULL ORDER BY m.createdAt DESC")
    List<Message> findRestaurantReceivedMessages(@Param("restaurantId") Long restaurantId);
    
    // Kullanıcının okunmamış mesajlarını getir
    @Query("SELECT m FROM Message m WHERE m.receiverId = :userId AND m.isRead = false AND m.deletedAt IS NULL ORDER BY m.createdAt DESC")
    List<Message> findUnreadMessagesByUserId(@Param("userId") Long userId);
    
    // Admin için özel olarak okunmamış mesajları getir (sadece receiverType ADMIN olanlar)
    @Query("SELECT m FROM Message m WHERE m.receiverId = :adminId AND m.receiverType = 'ADMIN' AND m.isRead = false AND m.deletedAt IS NULL ORDER BY m.createdAt DESC")
    List<Message> findAdminUnreadMessages(@Param("adminId") Long adminId);

    // Restaurant için özel olarak okunmamış mesajları getir (sadece receiverType RESTAURANT olanlar)
    @Query("SELECT m FROM Message m WHERE m.receiverId = :restaurantId AND m.receiverType = 'RESTAURANT' AND m.isRead = false AND m.deletedAt IS NULL ORDER BY m.createdAt DESC")
    List<Message> findRestaurantUnreadMessages(@Param("restaurantId") Long restaurantId);
    
    // Kullanıcı tipine göre mesajları getir
    @Query("SELECT m FROM Message m WHERE m.receiverType = :userType AND m.deletedAt IS NULL ORDER BY m.createdAt DESC")
    List<Message> findMessagesByReceiverType(@Param("userType") Message.UserType userType);
} 