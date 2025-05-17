package com.hufds.controller;

import com.hufds.dto.RestaurantProfileDTO;
import com.hufds.service.RestaurantProfileService;
import com.hufds.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class RestaurantProfileController {

    private final RestaurantProfileService restaurantProfileService;
    private final JwtService jwtService;

    @GetMapping("/restaurant")
    public ResponseEntity<RestaurantProfileDTO> getRestaurantProfile(HttpServletRequest request) {
        String token = extractToken(request);
        Integer restaurantId = jwtService.extractUserId(token);
        RestaurantProfileDTO profile = restaurantProfileService.getProfile(restaurantId);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/restaurant")
    public ResponseEntity<RestaurantProfileDTO> updateRestaurantProfile(
            HttpServletRequest request,
            @RequestBody RestaurantProfileDTO profileDTO) {
        String token = extractToken(request);
        Integer restaurantId = jwtService.extractUserId(token);
        RestaurantProfileDTO updatedProfile = restaurantProfileService.updateProfile(restaurantId, profileDTO);
        return ResponseEntity.ok(updatedProfile);
    }

    @PutMapping("/restaurant/address")
    public ResponseEntity<Void> updateRestaurantAddress(
            HttpServletRequest request,
            @RequestBody RestaurantProfileDTO.AddressDTO addressDTO) {
        String token = extractToken(request);
        Integer restaurantId = jwtService.extractUserId(token);
        restaurantProfileService.updateAddress(restaurantId, addressDTO);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/restaurant/location")
    public ResponseEntity<Void> updateRestaurantLocation(
            HttpServletRequest request,
            @RequestBody RestaurantProfileDTO.LocationDTO locationDTO) {
        String token = extractToken(request);
        Integer restaurantId = jwtService.extractUserId(token);
        restaurantProfileService.updateLocation(restaurantId, locationDTO);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/restaurant/image")
    public ResponseEntity<String> uploadRestaurantProfileImage(
            HttpServletRequest request,
            @RequestParam("profileImage") MultipartFile image) {
        String token = extractToken(request);
        Integer restaurantId = jwtService.extractUserId(token);
        String imageUrl = restaurantProfileService.uploadProfileImage(restaurantId, image);
        return ResponseEntity.ok(imageUrl);
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        throw new RuntimeException("Missing or invalid Authorization header");
    }
} 