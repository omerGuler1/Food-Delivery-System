package com.hufds.service.impl;

import com.hufds.dto.CreateReviewDTO;
import com.hufds.dto.ReviewResponseDTO;
import com.hufds.dto.ReviewResponseRequestDTO;
import com.hufds.entity.Courier;
import com.hufds.entity.Customer;
import com.hufds.entity.Order;
import com.hufds.entity.Restaurant;
import com.hufds.entity.Review;
import com.hufds.entity.Review.ReviewRole;
import com.hufds.exception.CustomException;
import com.hufds.repository.CourierRepository;
import com.hufds.repository.CustomerRepository;
import com.hufds.repository.OrderRepository;
import com.hufds.repository.RestaurantRepository;
import com.hufds.repository.ReviewRepository;
import com.hufds.service.ReviewService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final RestaurantRepository restaurantRepository;
    private final CourierRepository courierRepository;

    @Override
    @Transactional
    public ReviewResponseDTO createReview(Integer customerId, CreateReviewDTO reviewDTO) {
        // Validate customer exists
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomException("Customer not found", HttpStatus.NOT_FOUND));

        // Validate order exists and is delivered
        Order order = orderRepository.findById(reviewDTO.getOrderId())
                .orElseThrow(() -> new CustomException("Order not found", HttpStatus.NOT_FOUND));

        if (order.getStatus() != Order.OrderStatus.DELIVERED) {
            throw new CustomException("You can only review delivered orders", HttpStatus.BAD_REQUEST);
        }

        // Validate customer owns the order
        if (!order.getCustomer().getCustomerId().equals(customerId)) {
            throw new CustomException("You can only review your own orders", HttpStatus.FORBIDDEN);
        }

        // Validate a review doesn't already exist for this order, customer, and role
        if (reviewRepository.existsByOrderOrderIdAndCustomerCustomerIdAndRole(
                order.getOrderId(), customerId, reviewDTO.getRole())) {
            throw new CustomException("You have already reviewed this aspect of the order", HttpStatus.CONFLICT);
        }

        // Determine target ID based on role
        Integer targetId;
        if (reviewDTO.getRole() == ReviewRole.RESTAURANT) {
            targetId = order.getRestaurant().getRestaurantId();
        } else if (reviewDTO.getRole() == ReviewRole.COURIER) {
            if (order.getCourier() == null) {
                throw new CustomException("This order was not delivered by a courier", HttpStatus.BAD_REQUEST);
            }
            targetId = order.getCourier().getCourierId();
        } else {
            throw new CustomException("Invalid review role", HttpStatus.BAD_REQUEST);
        }

        // Create and save the review
        Review review = new Review();
        review.setCustomer(customer);
        review.setOrder(order);
        review.setTargetId(targetId);
        review.setRole(reviewDTO.getRole());
        review.setRating(reviewDTO.getRating());
        review.setComment(reviewDTO.getComment());

        Review savedReview = reviewRepository.save(review);

        return convertToDTO(savedReview);
    }

    @Override
    @Transactional
    public ReviewResponseDTO respondToReview(Integer reviewId, Integer responderId, 
                                          ReviewResponseRequestDTO responseDTO) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new CustomException("Review not found", HttpStatus.NOT_FOUND));

        // Check if the review already has a response
        if (review.getResponse() != null && !review.getResponse().isEmpty()) {
            throw new CustomException("This review already has a response", HttpStatus.CONFLICT);
        }

        // Validate that the responder is the target of the review
        if (!review.getTargetId().equals(responderId)) {
            throw new CustomException("You can only respond to reviews about you", HttpStatus.FORBIDDEN);
        }

        // Update the review with the response
        review.setResponse(responseDTO.getResponse());
        review.setRespondedAt(LocalDateTime.now());
        
        Review updatedReview = reviewRepository.save(review);
        
        return convertToDTO(updatedReview);
    }

    @Override
    public ReviewResponseDTO getReviewById(Integer reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new CustomException("Review not found", HttpStatus.NOT_FOUND));
        
        return convertToDTO(review);
    }

    @Override
    public List<ReviewResponseDTO> getReviewsByOrderId(Integer orderId) {
        List<Review> reviews = reviewRepository.findByOrderOrderId(orderId);
        return reviews.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewResponseDTO> getReviewsByCustomerId(Integer customerId) {
        List<Review> reviews = reviewRepository.findByCustomerCustomerId(customerId);
        return reviews.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewResponseDTO> getReviewsByTargetId(Integer targetId, ReviewRole role) {
        List<Review> reviews = reviewRepository.findByTargetIdAndRole(targetId, role);
        return reviews.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public boolean canCustomerReviewOrderRole(Integer customerId, Integer orderId, ReviewRole role) {
        // Check if order exists and is delivered
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException("Order not found", HttpStatus.NOT_FOUND));
                
        if (order.getStatus() != Order.OrderStatus.DELIVERED) {
            return false;
        }
        
        // Check if order belongs to customer
        if (!order.getCustomer().getCustomerId().equals(customerId)) {
            return false;
        }
        
        // Check if role is COURIER and order has a courier
        if (role == ReviewRole.COURIER && order.getCourier() == null) {
            return false;
        }
        
        // Check if review already exists
        return !reviewRepository.existsByOrderOrderIdAndCustomerCustomerIdAndRole(
                orderId, customerId, role);
    }

    @Override
    public boolean canTargetRespondToReview(Integer targetId, Integer reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new CustomException("Review not found", HttpStatus.NOT_FOUND));
                
        // Check if target is the one being reviewed
        if (!review.getTargetId().equals(targetId)) {
            return false;
        }
        
        // Check if review already has a response
        return review.getResponse() == null || review.getResponse().isEmpty();
    }

    @Override
    public Double getAverageRatingForTarget(Integer targetId, ReviewRole role) {
        return reviewRepository.calculateAverageRating(targetId, role);
    }

    // Helper method to convert Review entity to DTO
    private ReviewResponseDTO convertToDTO(Review review) {
        ReviewResponseDTO dto = new ReviewResponseDTO();
        dto.setReviewId(review.getReviewId());
        dto.setCustomerId(review.getCustomer().getCustomerId());
        dto.setCustomerName(review.getCustomer().getName());
        dto.setOrderId(review.getOrder().getOrderId());
        dto.setTargetId(review.getTargetId());
        dto.setRole(review.getRole());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setResponse(review.getResponse());
        dto.setRespondedAt(review.getRespondedAt());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
} 