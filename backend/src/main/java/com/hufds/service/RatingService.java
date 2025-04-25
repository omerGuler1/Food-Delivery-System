package com.hufds.service;

import com.hufds.dto.RatingDTO;
import com.hufds.dto.RatingResponseDTO;
import java.util.List;

public interface RatingService {
    RatingResponseDTO createRating(Integer customerId, RatingDTO ratingDTO);
    List<RatingResponseDTO> getRestaurantRatings(Integer restaurantId);
    List<RatingResponseDTO> getCustomerRatings(Integer customerId);
    Double getRestaurantAverageRating(Integer restaurantId);
    boolean canCustomerRateOrder(Integer customerId, Integer orderId);
} 