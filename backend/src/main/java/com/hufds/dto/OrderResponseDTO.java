package com.hufds.dto;

import com.hufds.entity.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class OrderResponseDTO {
    private Integer orderId;
    private Address address;
    private BigDecimal totalPrice;
    private Order.OrderStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime deliveredAt;
    private Payment payment;
    private Set<OrderItem> orderItems;
    private Set<CourierAssignment> courierAssignments;
    
    // Customer information
    private CustomerInfoDTO customer;
    
    @Data
    public static class CustomerInfoDTO {
        private Integer customerId;
        private String name;
        private String email;
        private String phoneNumber;
    }
    
    // Factory method to create DTO from entity
    public static OrderResponseDTO fromOrder(Order order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setOrderId(order.getOrderId());
        dto.setAddress(order.getAddress());
        dto.setTotalPrice(order.getTotalPrice());
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setDeliveredAt(order.getDeliveredAt());
        dto.setPayment(order.getPayment());
        dto.setOrderItems(order.getOrderItems());
        dto.setCourierAssignments(order.getCourierAssignments());
        
        // Set customer information
        if (order.getCustomer() != null) {
            CustomerInfoDTO customerInfo = new CustomerInfoDTO();
            customerInfo.setCustomerId(order.getCustomer().getCustomerId());
            customerInfo.setName(order.getCustomer().getName());
            customerInfo.setEmail(order.getCustomer().getEmail());
            customerInfo.setPhoneNumber(order.getCustomer().getPhoneNumber());
            dto.setCustomer(customerInfo);
        }
        
        return dto;
    }
} 