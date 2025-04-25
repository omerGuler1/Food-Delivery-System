package com.hufds.dto;

import com.hufds.entity.Order.OrderStatus;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO {
    private Integer orderId;
    
    @NotNull(message = "Restaurant ID is required")
    private Integer restaurantId;
    
    @NotNull(message = "User ID is required")
    private Integer userId;
    
    @NotEmpty(message = "Order items are required")
    private List<OrderItemDTO> orderItems;
    
    private OrderStatus status;
    private Double totalAmount;
    private String deliveryAddress;
    private LocalDateTime orderTime;
    private LocalDateTime deliveryTime;
    private String specialInstructions;
} 