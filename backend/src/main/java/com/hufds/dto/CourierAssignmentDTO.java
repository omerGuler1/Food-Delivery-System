package com.hufds.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CourierAssignmentDTO {
    @NotNull(message = "Order ID is required")
    private Integer orderId;
    
    @NotNull(message = "Courier ID is required")
    private Integer courierId;
} 