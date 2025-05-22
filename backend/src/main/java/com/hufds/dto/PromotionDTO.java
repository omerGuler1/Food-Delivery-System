package com.hufds.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromotionDTO {
    private Long id;
    private String name;
    private String description;
    private Double discountPercentage;
    private LocalDate endDate;
    private Boolean isActive;
} 