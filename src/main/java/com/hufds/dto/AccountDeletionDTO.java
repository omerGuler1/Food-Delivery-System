package com.hufds.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AccountDeletionDTO {
    @NotNull(message = "User ID is required")
    private Integer userId;

    @NotNull(message = "Confirmation is required")
    private Boolean confirmation;
}