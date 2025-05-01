package com.hufds.service;

import com.hufds.dto.OrderItemRequestDTO;
import com.hufds.dto.PlaceOrderRequestDTO;
import com.hufds.entity.Order;
import com.hufds.entity.Order.OrderStatus;

import java.util.List;
import java.util.Optional;

public interface OrderService {
    Order placeOrder(PlaceOrderRequestDTO dto);
    Optional<Order> getOrderById(Integer id, Integer userId, String userType);
    Order updateOrderStatus(Integer id, OrderStatus status, Integer userId, String userType);
    Order cancelOrder(Integer id, Integer customerId);
    List<Order> getRestaurantOrders(Integer restaurantId, OrderStatus status);
    List<Order> getAllRestaurantOrders(Integer restaurantId);
    
    /**
     * Get active orders for a courier.
     * These are orders with OUT_FOR_DELIVERY status assigned to this courier.
     * Restaurant and customer details are included in the response.
     * 
     * @param courierId The courier ID
     * @return List of active orders
     */
    List<Order> getActiveCourierOrders(Integer courierId);
}