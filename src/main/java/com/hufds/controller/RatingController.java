package com.hufds.controller;

import com.hufds.dto.RatingDTO;
import com.hufds.dto.RatingResponseDTO;
import com.hufds.service.JwtService;
import com.hufds.service.RatingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<RatingResponseDTO> createRating(
            @Valid @RequestBody RatingDTO ratingDTO,
            HttpServletRequest request) {
        Integer customerId = jwtService.extractUserId(getToken(request));
        return ResponseEntity.ok(ratingService.createRating(customerId, ratingDTO));
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<RatingResponseDTO>> getRestaurantRatings(
            @PathVariable Integer restaurantId) {
        return ResponseEntity.ok(ratingService.getRestaurantRatings(restaurantId));
    }

    @GetMapping("/restaurant/{restaurantId}/average")
    public ResponseEntity<Double> getRestaurantAverageRating(
            @PathVariable Integer restaurantId) {
        return ResponseEntity.ok(ratingService.getRestaurantAverageRating(restaurantId));
    }

    @GetMapping("/customer")
    public ResponseEntity<List<RatingResponseDTO>> getCustomerRatings(
            HttpServletRequest request) {
        Integer customerId = jwtService.extractUserId(getToken(request));
        return ResponseEntity.ok(ratingService.getCustomerRatings(customerId));
    }

    @GetMapping("/can-rate/{orderId}")
    public ResponseEntity<Boolean> canRateOrder(
            @PathVariable Integer orderId,
            HttpServletRequest request) {
        Integer customerId = jwtService.extractUserId(getToken(request));
        return ResponseEntity.ok(ratingService.canCustomerRateOrder(customerId, orderId));
    }

    private String getToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        throw new RuntimeException("Authorization header missing or invalid");
    }
} 