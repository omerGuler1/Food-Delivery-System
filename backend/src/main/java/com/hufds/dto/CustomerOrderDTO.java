package com.hufds.dto;

import com.hufds.entity.Order.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerOrderDTO {
    private Integer orderId;
    private OrderStatus status;
    private BigDecimal totalPrice;
    private LocalDateTime createdAt;
    private LocalDateTime deliveredAt;
    
    // Restaurant information
    private RestaurantSummaryDTO restaurant;
    
    // Courier information
    private CourierInfoDTO courier;
    
    // Address information (nested object so that frontend can use order.address.fullAddress, etc.)
    private AddressSummaryDTO address;
    
    // Order items
    private Set<OrderItemDTO> orderItems;
    
    // Payment information
    private PaymentDTO payment;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentDTO {
        private Integer paymentId;
        private String paymentMethod;
        private String paymentStatus;
        private LocalDateTime paymentDate;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourierInfoDTO {
        private Integer courierId;
        private String name;
        private String phoneNumber;
        private String vehicleType;
    }
} 