package com.hufds.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RatingResponseDTO {
    private Integer id;
    private Integer orderId;
    private Integer customerId;
    private Integer restaurantId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private String customerName;
    private String restaurantName;
} 