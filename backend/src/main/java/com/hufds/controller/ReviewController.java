package com.hufds.controller;

import com.hufds.dto.CreateReviewDTO;
import com.hufds.dto.ReviewResponseDTO;
import com.hufds.dto.ReviewResponseRequestDTO;
import com.hufds.entity.Review.ReviewRole;
import com.hufds.service.JwtService;
import com.hufds.service.ReviewService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<ReviewResponseDTO> createReview(
            @Valid @RequestBody CreateReviewDTO reviewDTO,
            HttpServletRequest request) {
        Integer customerId = jwtService.extractUserId(getToken(request));
        return ResponseEntity.ok(reviewService.createReview(customerId, reviewDTO));
    }

    @PostMapping("/{reviewId}/response")
    public ResponseEntity<ReviewResponseDTO> respondToReview(
            @PathVariable Integer reviewId,
            @Valid @RequestBody ReviewResponseRequestDTO responseDTO,
            HttpServletRequest request) {
        Integer responderId = jwtService.extractUserId(getToken(request));
        return ResponseEntity.ok(reviewService.respondToReview(reviewId, responderId, responseDTO));
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewResponseDTO> getReviewById(
            @PathVariable Integer reviewId) {
        return ResponseEntity.ok(reviewService.getReviewById(reviewId));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<ReviewResponseDTO>> getReviewsByOrderId(
            @PathVariable Integer orderId) {
        return ResponseEntity.ok(reviewService.getReviewsByOrderId(orderId));
    }

    @GetMapping("/customer")
    public ResponseEntity<List<ReviewResponseDTO>> getCustomerReviews(
            HttpServletRequest request) {
        Integer customerId = jwtService.extractUserId(getToken(request));
        return ResponseEntity.ok(reviewService.getReviewsByCustomerId(customerId));
    }

    @GetMapping("/target/{targetId}")
    public ResponseEntity<List<ReviewResponseDTO>> getReviewsByTargetId(
            @PathVariable Integer targetId,
            @RequestParam ReviewRole role) {
        return ResponseEntity.ok(reviewService.getReviewsByTargetId(targetId, role));
    }

    @GetMapping("/public/target/{targetId}")
    public ResponseEntity<List<ReviewResponseDTO>> getPublicReviewsByTargetId(
            @PathVariable Integer targetId,
            @RequestParam ReviewRole role) {
        return ResponseEntity.ok(reviewService.getReviewsByTargetId(targetId, role));
    }

    @GetMapping("/target/{targetId}/average")
    public ResponseEntity<Double> getAverageRatingForTarget(
            @PathVariable Integer targetId,
            @RequestParam ReviewRole role) {
        return ResponseEntity.ok(reviewService.getAverageRatingForTarget(targetId, role));
    }

    @GetMapping("/public/target/{targetId}/average")
    public ResponseEntity<Double> getPublicAverageRatingForTarget(
            @PathVariable Integer targetId,
            @RequestParam ReviewRole role) {
        return ResponseEntity.ok(reviewService.getAverageRatingForTarget(targetId, role));
    }

    @GetMapping("/can-review")
    public ResponseEntity<Boolean> canCustomerReviewOrderRole(
            @RequestParam Integer orderId,
            @RequestParam ReviewRole role,
            HttpServletRequest request) {
        Integer customerId = jwtService.extractUserId(getToken(request));
        return ResponseEntity.ok(reviewService.canCustomerReviewOrderRole(customerId, orderId, role));
    }

    @GetMapping("/can-respond")
    public ResponseEntity<Boolean> canTargetRespondToReview(
            @RequestParam Integer reviewId,
            HttpServletRequest request) {
        Integer targetId = jwtService.extractUserId(getToken(request));
        return ResponseEntity.ok(reviewService.canTargetRespondToReview(targetId, reviewId));
    }

    private String getToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        throw new RuntimeException("Authorization header missing or invalid");
    }
} 