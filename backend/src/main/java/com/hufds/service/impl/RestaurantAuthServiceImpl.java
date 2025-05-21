package com.hufds.service.impl;

import com.hufds.dto.RestaurantLoginDTO;
import com.hufds.dto.RestaurantRegisterDTO;
import com.hufds.dto.RestaurantResponseDTO;
import com.hufds.entity.Restaurant;
import com.hufds.exception.CustomException;
import com.hufds.repository.RestaurantRepository;
import com.hufds.service.JwtService;
import com.hufds.service.RestaurantAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RestaurantAuthServiceImpl implements RestaurantAuthService {

    private final RestaurantRepository restaurantRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public RestaurantResponseDTO register(RestaurantRegisterDTO registerDTO) {
        // Check if email is already in use
        if (restaurantRepository.findByEmail(registerDTO.getEmail()).isPresent()) {
            throw new CustomException("Email already registered", HttpStatus.CONFLICT);
        }

        // Create new restaurant entity
        Restaurant restaurant = new Restaurant();
        restaurant.setName(registerDTO.getName());
        restaurant.setEmail(registerDTO.getEmail());
        restaurant.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        restaurant.setPhoneNumber(registerDTO.getPhoneNumber());
        restaurant.setCuisineType(registerDTO.getCuisineType());
        // Set approval status to PENDING by default
        restaurant.setApprovalStatus(Restaurant.ApprovalStatus.PENDING);

        // Save to DB
        Restaurant saved = restaurantRepository.save(restaurant);

        // Generate JWT
        String token = jwtService.generateToken(saved.getEmail(), saved.getRestaurantId(), "restaurant");

        return RestaurantResponseDTO.builder()
                .token(token)
                .restaurantId(saved.getRestaurantId())
                .name(saved.getName())
                .email(saved.getEmail())
                .phoneNumber(saved.getPhoneNumber())
                .cuisineType(saved.getCuisineType())
                .rating(saved.getRating())
                .approvalStatus(saved.getApprovalStatus())
                .build();
    }

    @Override
    public RestaurantResponseDTO login(RestaurantLoginDTO loginDTO) {
        Restaurant restaurant = restaurantRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new CustomException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (restaurant.getDeletedAt() != null) {
            throw new CustomException("Account has been deleted", HttpStatus.UNAUTHORIZED);
        }

        if (!passwordEncoder.matches(loginDTO.getPassword(), restaurant.getPassword())) {
            throw new CustomException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        // Allow login but include approval status in the response
        // Frontend will handle redirection based on approval status
        String token = jwtService.generateToken(restaurant.getEmail(), restaurant.getRestaurantId(), "restaurant");

        return RestaurantResponseDTO.builder()
                .token(token)
                .restaurantId(restaurant.getRestaurantId())
                .name(restaurant.getName())
                .email(restaurant.getEmail())
                .phoneNumber(restaurant.getPhoneNumber())
                .cuisineType(restaurant.getCuisineType())
                .rating(restaurant.getRating())
                .approvalStatus(restaurant.getApprovalStatus())
                .build();
    }
} 