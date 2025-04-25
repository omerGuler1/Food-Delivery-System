package com.hufds.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemSearchDTO {
    private String name;
    private String category;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Boolean isAvailable;
    @Builder.Default
    private Integer restaurantId = null;
} 