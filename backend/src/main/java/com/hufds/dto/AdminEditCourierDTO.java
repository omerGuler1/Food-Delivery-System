package com.hufds.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class AdminEditCourierDTO {
    private Integer courierId;
    
    private String name;

    @Email(message = "Invalid email format")
    private String email;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
    private String phoneNumber;
    
    private String vehicleType;
    
    // Şifre değiştirmek için opsiyonel alan (şifre değiştirilmeyecekse null bırakılabilir)
    private String newPassword;
} 