package com.hufds.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ProfileUpdateDTO {
    private String name;

    @Email(message = "Invalid email format")
    private String email;

    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()\\-_=+{};:,<.>?])(?=\\S+$).{8,}$",
            message = "If phone number is provided, it must be in valid format")
    private String phoneNumber;
}