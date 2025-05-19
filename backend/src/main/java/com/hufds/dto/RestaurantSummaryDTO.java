package com.hufds.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RestaurantSummaryDTO {
    private Integer restaurantId;
    private String name;
    private String phoneNumber;
    private String cuisineType;
} 