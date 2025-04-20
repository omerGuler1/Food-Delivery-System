package com.hufds.dto;

import com.hufds.entity.Order.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderStatusUpdateDTO {
    @NotNull(message = "Order status is required")
    private OrderStatus status;
    
    private String statusUpdateReason;
} 