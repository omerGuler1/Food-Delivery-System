package com.hufds.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class AdminEditRestaurantDTO {
    private Integer restaurantId;
    
    private String name;

    @Email(message = "Invalid email format")
    private String email;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
    private String phoneNumber;
    
    private String cuisineType;

    // Adres bilgileri (opsiyonel)
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    
    // Şifre değiştirmek için opsiyonel alan (şifre değiştirilmeyecekse null bırakılabilir)
    private String newPassword;
} 