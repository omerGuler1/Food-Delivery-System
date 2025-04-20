package com.hufds.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessHoursDTO {
    private Integer hoursId;
    
    @NotNull(message = "Day of week is required")
    private String dayOfWeek;
    
    @NotNull(message = "Open time is required")
    private LocalTime openTime;
    
    @NotNull(message = "Close time is required")
    private LocalTime closeTime;
    
    @NotNull(message = "Closed status is required")
    private Boolean isClosed;
} 