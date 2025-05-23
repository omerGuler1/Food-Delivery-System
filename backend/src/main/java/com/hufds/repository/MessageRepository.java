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
    
    // Courier için özel olarak alınan mesajları getir (sadece receiverType COURIER olanlar)
    @Query("SELECT m FROM Message m WHERE m.receiverId = :courierId AND m.receiverType = 'COURIER' AND m.deletedAt IS NULL ORDER BY m.createdAt DESC")
    List<Message> findCourierReceivedMessages(@Param("courierId") Long courierId);
    
    // Customer için özel olarak alınan mesajları getir (sadece receiverType CUSTOMER olanlar)
    @Query("SELECT m FROM Message m WHERE m.receiverId = :customerId AND m.receiverType = 'CUSTOMER' AND m.deletedAt IS NULL ORDER BY m.createdAt DESC")
    List<Message> findCustomerReceivedMessages(@Param("customerId") Long customerId);
    
    // Kullanıcının okunmamış mesajlarını getir
    @Query("SELECT m FROM Message m WHERE m.receiverId = :userId AND m.isRead = false AND m.deletedAt IS NULL ORDER BY m.createdAt DESC")
    List<Message> findUnreadMessagesByUserId(@Param("userId") Long userId);
    
    // Admin için özel olarak okunmamış mesajları getir (sadece receiverType ADMIN olanlar)
    @Query("SELECT m FROM Message m WHERE m.receiverId = :adminId AND m.receiverType = 'ADMIN' AND m.isRead = false AND m.deletedAt IS NULL ORDER BY m.createdAt DESC")
    List<Message> findAdminUnreadMessages(@Param("adminId") Long adminId);

    // Restaurant için özel olarak okunmamış mesajları getir (sadece receiverType RESTAURANT olanlar)
    @Query("SELECT m FROM Message m WHERE m.receiverId = :restaurantId AND m.receiverType = 'RESTAURANT' AND m.isRead = false AND m.deletedAt IS NULL ORDER BY m.createdAt DESC")
    List<Message> findRestaurantUnreadMessages(@Param("restaurantId") Long restaurantId);
    
    // Courier için özel olarak okunmamış mesajları getir (sadece receiverType COURIER olanlar)
    @Query("SELECT m FROM Message m WHERE m.receiverId = :courierId AND m.receiverType = 'COURIER' AND m.isRead = false AND m.deletedAt IS NULL ORDER BY m.createdAt DESC")
    List<Message> findCourierUnreadMessages(@Param("courierId") Long courierId);
    
    // Customer için özel olarak okunmamış mesajları getir (sadece receiverType CUSTOMER olanlar)
    @Query("SELECT m FROM Message m WHERE m.receiverId = :customerId AND m.receiverType = 'CUSTOMER' AND m.isRead = false AND m.deletedAt IS NULL ORDER BY m.createdAt DESC")
    List<Message> findCustomerUnreadMessages(@Param("customerId") Long customerId);
    
    // Kullanıcı tipine göre mesajları getir
    @Query("SELECT m FROM Message m WHERE m.receiverType = :userType AND m.deletedAt IS NULL ORDER BY m.createdAt DESC")
    List<Message> findMessagesByReceiverType(@Param("userType") Message.UserType userType);
} 