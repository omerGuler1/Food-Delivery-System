package com.hufds.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderSummaryDTO {
    private Integer orderId;
    private String restaurantName;
    private String status;
    private String createdAt;
    private BigDecimal totalPrice;
}
