package com.hufds.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantProfileDTO {
    @NotBlank(message = "Restaurant name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number")
    private String phoneNumber;

    @NotBlank(message = "Cuisine type is required")
    private String cuisineType;

    private AddressDTO address;
    private LocationDTO location;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressDTO {
        @NotBlank(message = "Street is required")
        private String street;

        @NotBlank(message = "City is required")
        private String city;

        @NotBlank(message = "State is required")
        private String state;

        @NotBlank(message = "ZIP code is required")
        private String zipCode;

        @NotBlank(message = "Country is required")
        private String country;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocationDTO {
        @NotNull(message = "Latitude is required")
        private BigDecimal latitude;

        @NotNull(message = "Longitude is required")
        private BigDecimal longitude;
    }
} 