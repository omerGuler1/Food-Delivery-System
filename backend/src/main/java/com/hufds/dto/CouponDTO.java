package com.hufds.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal discountAmount;
    private BigDecimal minOrderAmount;
    private Integer quota;
    private Integer usageCount;
    private LocalDateTime createdAt;
    private LocalDate endDate;
    private Boolean isActive;
} 