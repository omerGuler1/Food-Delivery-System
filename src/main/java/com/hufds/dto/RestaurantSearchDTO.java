package com.hufds.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantSearchDTO {
    private String name;
    private String cuisineType;
    private String city;
    private String state;
    private String country;
    private Double minPrice;
    private Double maxPrice;
    private String deliveryTime;
    private Double latitude;
    private Double longitude;
    private Integer maxDistanceKm;
} 