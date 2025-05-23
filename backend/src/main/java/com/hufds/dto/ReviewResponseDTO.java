package com.hufds.dto;

import com.hufds.entity.Review.ReviewRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDTO {
    private Integer reviewId;
    private Integer customerId;
    private String customerName;
    private Integer orderId;
    private Integer targetId;
    private ReviewRole role;
    private Integer rating;
    private String comment;
    private String response;
    private LocalDateTime respondedAt;
    private LocalDateTime createdAt;
} 