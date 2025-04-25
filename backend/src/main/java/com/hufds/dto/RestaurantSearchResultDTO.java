package com.hufds.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantSearchResultDTO {
    private Integer restaurantId;
    private String name;
    private String cuisineType;
    private String phoneNumber;
    private float rating;
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer deliveryRangeKm;
    private LocalTime estimatedDeliveryTime;
    private Double averagePrice;
    private boolean isOpen;
} 