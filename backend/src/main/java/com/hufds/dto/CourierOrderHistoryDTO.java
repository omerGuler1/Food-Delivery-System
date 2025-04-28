package com.hufds.dto;

import com.hufds.entity.CourierAssignment;
import com.hufds.entity.Order;
import lombok.Data;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class CourierOrderHistoryDTO {
    private Integer orderId;
    private Integer assignmentId;
    private String restaurantName;
    private String customerName;
    private String deliveryAddress;
    private BigDecimal totalPrice;
    private Order.OrderStatus orderStatus;
    private CourierAssignment.AssignmentStatus assignmentStatus;
    private LocalDateTime assignedAt;
    private LocalDateTime pickedUpAt;
    private LocalDateTime deliveredAt;
} 