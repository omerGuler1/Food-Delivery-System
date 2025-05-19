package com.hufds.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemDTO {
    private Integer itemId;
    
    @NotNull(message = "Menu item ID is required")
    private MenuItemSummaryDTO menuItem;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
    
    private Double subtotal;
    private String specialInstructions;
} 