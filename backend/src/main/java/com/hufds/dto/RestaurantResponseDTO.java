package com.hufds.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantResponseDTO {
    private String token;
    private Integer restaurantId;
    private String name;
    private String email;
    private String phoneNumber;
    private String cuisineType;
    private float rating;
}