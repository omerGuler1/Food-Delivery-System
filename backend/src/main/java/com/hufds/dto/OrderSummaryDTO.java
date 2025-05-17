package com.hufds.dto;

import com.hufds.entity.Order;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class OrderSummaryDTO {
    private Integer orderId;
    private LocalDateTime createdAt;
    private String status;
    private BigDecimal totalPrice;
    private String restaurantName;
    private String courierName;

    public static OrderSummaryDTO fromEntity(Order order) {
        return OrderSummaryDTO.builder()
            .orderId(order.getOrderId())
            .createdAt(order.getCreatedAt())
            .status(order.getStatus().toString())
            .totalPrice(order.getTotalPrice())
            .restaurantName(order.getRestaurant() != null ? order.getRestaurant().getName() : null)
            .courierName(order.getCourier() != null ? order.getCourier().getName() : null)
            .build();
    }
}
