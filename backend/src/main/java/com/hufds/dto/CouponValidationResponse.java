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
public class CouponValidationResponse {
    private boolean valid;
    private Long couponId;
    private String name;
    private String description;
    private BigDecimal discountAmount;
    private BigDecimal minOrderAmount;
    private String message;
} 