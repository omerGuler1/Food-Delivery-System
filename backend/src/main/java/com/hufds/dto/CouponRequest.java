package com.hufds.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponRequest {
    private String name;
    private String description;
    private BigDecimal discountAmount;
    private BigDecimal minOrderAmount;
    private Integer quota;
    private LocalDate endDate;
    private Boolean isActive;
} 