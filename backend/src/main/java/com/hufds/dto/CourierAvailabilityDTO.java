package com.hufds.dto;

import com.hufds.entity.Courier.CourierStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CourierAvailabilityDTO {
    @NotNull(message = "Availability status is required")
    private CourierStatus status;
} 