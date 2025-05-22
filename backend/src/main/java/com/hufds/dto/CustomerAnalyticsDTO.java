package com.hufds.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerAnalyticsDTO {
    private Integer customerId;
    private String customerName;
    private String customerEmail;
    private Integer totalOrders;
    private BigDecimal totalSpent;
    private Float averageOrderValue;
} 