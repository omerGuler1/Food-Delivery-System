package com.hufds.service.impl;

import com.hufds.dto.RatingDTO;
import com.hufds.dto.RatingResponseDTO;
import com.hufds.entity.Order;
import com.hufds.entity.Review;
import com.hufds.entity.Review.ReviewRole;
import com.hufds.exception.CustomException;
import com.hufds.repository.OrderRepository;
import com.hufds.repository.ReviewRepository;
import com.hufds.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RatingServiceImpl implements RatingService {

    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;

    @Override
    @Transactional
    public RatingResponseDTO createRating(Integer customerId, RatingDTO ratingDTO) {
        Order order = orderRepository.findById(ratingDTO.getOrderId())
                .orElseThrow(() -> new CustomException("Order not found", HttpStatus.NOT_FOUND));

        // Validate that the order belongs to the customer
        if (!order.getCustomer().getCustomerId().equals(customerId)) {
            throw new CustomException("You can only rate your own orders", HttpStatus.FORBIDDEN);
        }

        // Validate order status
        if (order.getStatus() != Order.OrderStatus.DELIVERED) {
            throw new CustomException("You can only rate delivered orders", HttpStatus.BAD_REQUEST);
        }

        // Create review
        Review review = new Review();
        review.setCustomer(order.getCustomer());
        review.setTargetId(order.getRestaurant().getRestaurantId());
        review.setRole(ReviewRole.Restaurant);
        review.setRating(ratingDTO.getRating());
        review.setComment(ratingDTO.getComment());

        Review savedReview = reviewRepository.save(review);

        return convertToRatingResponse(savedReview, order);
    }

    @Override
    public List<RatingResponseDTO> getRestaurantRatings(Integer restaurantId) {
        List<Review> reviews = reviewRepository.findByTargetIdAndRole(restaurantId, ReviewRole.Restaurant);
        return convertToRatingResponses(reviews);
    }

    @Override
    public List<RatingResponseDTO> getCustomerRatings(Integer customerId) {
        List<Review> reviews = reviewRepository.findByCustomerCustomerId(customerId);
        return convertToRatingResponses(reviews);
    }

    @Override
    public Double getRestaurantAverageRating(Integer restaurantId) {
        return reviewRepository.calculateAverageRating(restaurantId, ReviewRole.Restaurant);
    }

    @Override
    public boolean canCustomerRateOrder(Integer customerId, Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException("Order not found", HttpStatus.NOT_FOUND));

        return order.getCustomer().getCustomerId().equals(customerId) &&
               order.getStatus() == Order.OrderStatus.DELIVERED;
    }

    private RatingResponseDTO convertToRatingResponse(Review review, Order order) {
        return RatingResponseDTO.builder()
                .id(review.getReviewId())
                .orderId(order.getOrderId())
                .customerId(review.getCustomer().getCustomerId())
                .restaurantId(review.getTargetId())
                .rating(review.getRating())
                .comment(review.getComment())
                .customerName(review.getCustomer().getName())
                .restaurantName(order.getRestaurant().getName())
                .build();
    }

    private List<RatingResponseDTO> convertToRatingResponses(List<Review> reviews) {
        List<RatingResponseDTO> responses = new ArrayList<>();
        for (Review review : reviews) {
            // Find corresponding order for this review
            Order order = orderRepository.findByCustomerCustomerIdAndRestaurantRestaurantId(
                review.getCustomer().getCustomerId(), 
                review.getTargetId())
                .stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.DELIVERED)
                .findFirst()
                .orElse(null);

            if (order != null) {
                responses.add(convertToRatingResponse(review, order));
            }
        }
        return responses;
    }
} 