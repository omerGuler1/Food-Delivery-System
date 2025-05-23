package com.hufds.service;

import com.hufds.dto.CreateReviewDTO;
import com.hufds.dto.ReviewResponseDTO;
import com.hufds.dto.ReviewResponseRequestDTO;
import com.hufds.entity.Review.ReviewRole;

import java.util.List;

public interface ReviewService {
    ReviewResponseDTO createReview(Integer customerId, CreateReviewDTO reviewDTO);
    
    ReviewResponseDTO respondToReview(Integer reviewId, Integer responderId, ReviewResponseRequestDTO responseDTO);
    
    ReviewResponseDTO getReviewById(Integer reviewId);
    
    List<ReviewResponseDTO> getReviewsByOrderId(Integer orderId);
    
    List<ReviewResponseDTO> getReviewsByCustomerId(Integer customerId);
    
    List<ReviewResponseDTO> getReviewsByTargetId(Integer targetId, ReviewRole role);
    
    boolean canCustomerReviewOrderRole(Integer customerId, Integer orderId, ReviewRole role);
    
    boolean canTargetRespondToReview(Integer targetId, Integer reviewId);
    
    Double getAverageRatingForTarget(Integer targetId, ReviewRole role);
} 