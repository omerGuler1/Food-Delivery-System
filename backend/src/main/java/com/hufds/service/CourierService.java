package com.hufds.service;

import com.hufds.entity.Courier;
import com.hufds.entity.Order;
import com.hufds.dto.PasswordUpdateDTO;
import com.hufds.dto.CourierProfileDTO;

import java.util.List;

public interface CourierService {
    // Profile operations
    Courier getCourierProfile(Integer courierId);
    Courier updateCourierProfile(Integer courierId, Courier courier);
    void updateCourierStatus(Integer courierId, Courier.CourierStatus status);
    
    // Availability operations
    boolean isCourierAvailable(Integer courierId);
    
    // Order operations
    List<Order> getActiveDeliveries(Integer courierId);
    List<Order> getPastDeliveries(Integer courierId);
    Order completeDelivery(Integer courierId, Integer orderId);
    Order cancelDelivery(Integer courierId, Integer orderId);
    
    // Earnings operations
    double getTotalEarnings(Integer courierId);
    
    // Password operations
    void updatePassword(Integer courierId, PasswordUpdateDTO passwordUpdateDTO);

    // Add this method for updating from DTO
    Courier updateCourierProfileFromDTO(Integer courierId, CourierProfileDTO dto);

    void deleteCourierAccount(Integer courierId);
} 