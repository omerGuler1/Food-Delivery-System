package com.hufds.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantConfigDTO {
    @NotNull(message = "Delivery range is required")
    @Min(value = 1, message = "Delivery range must be at least 1 km")
    private Integer deliveryRangeKm;
} 