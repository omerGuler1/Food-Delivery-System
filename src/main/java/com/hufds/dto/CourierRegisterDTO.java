package com.hufds.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CourierRegisterDTO {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()\\-_=+{};:,<.>?])(?=\\S+$).{8,}$",
            message = "Password must be at least 8 characters long and contain at least one digit, one lowercase letter, one uppercase letter, and one special character"
    )
    private String password;


    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number")
    private String phoneNumber;
    
    @NotBlank(message = "Vehicle type is required")
    private String vehicleType;
}