package com.hufds.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MenuItemSummaryDTO {
    private Integer menuItemId;
    private String name;
    private Double price; // (or BigDecimal, if you prefer)
    // (add any other summary fields you need, e.g. description, image, etc.)
} 