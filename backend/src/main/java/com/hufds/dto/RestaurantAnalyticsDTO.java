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
public class RestaurantAnalyticsDTO {
    private Integer restaurantId;
    private String restaurantName;
    private Integer totalOrders;
    private BigDecimal totalRevenue;
    private Float averageOrderValue;
} 