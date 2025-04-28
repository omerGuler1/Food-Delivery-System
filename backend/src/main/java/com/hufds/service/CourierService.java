package com.hufds.service;

import com.hufds.entity.Courier;
import com.hufds.entity.Order;

import java.util.List;

public interface CourierService {
    // Profile operations
    Courier getCourierProfile(Integer courierId);
    Courier updateCourierProfile(Integer courierId, Courier courier);
    void updateCourierStatus(Integer courierId, Courier.CourierStatus status);
    
    // Availability operations
    boolean isCourierAvailable(Integer courierId);
    
    // Order operations
    List<Order> getAvailableOrders();
    List<Order> getActiveDeliveries(Integer courierId);
    List<Order> getPastDeliveries(Integer courierId);
    Order acceptOrder(Integer courierId, Integer orderId);
    Order completeDelivery(Integer courierId, Integer orderId);
    Order cancelDelivery(Integer courierId, Integer orderId);
    
    // Earnings operations
    Double getTotalEarnings(Integer courierId);
} 