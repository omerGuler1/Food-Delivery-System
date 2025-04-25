package com.hufds.controller;

import com.hufds.dto.RestaurantSearchDTO;
import com.hufds.dto.RestaurantSearchResultDTO;
import com.hufds.service.RestaurantSearchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantSearchController {

    private final RestaurantSearchService restaurantSearchService;

    @GetMapping("/search")
    public ResponseEntity<List<RestaurantSearchResultDTO>> searchRestaurants(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String cuisineType,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String deliveryTime,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) Integer maxDistanceKm
    ) {
        RestaurantSearchDTO searchDTO = RestaurantSearchDTO.builder()
            .name(name)
            .cuisineType(cuisineType)
            .city(city)
            .state(state)
            .country(country)
            .minPrice(minPrice)
            .maxPrice(maxPrice)
            .deliveryTime(deliveryTime)
            .latitude(latitude)
            .longitude(longitude)
            .maxDistanceKm(maxDistanceKm)
            .build();

        List<RestaurantSearchResultDTO> results = restaurantSearchService.searchRestaurants(searchDTO);
        return ResponseEntity.ok(results);
    }

    @PostMapping("/search")
    public ResponseEntity<List<RestaurantSearchResultDTO>> searchRestaurants(
            @Valid @RequestBody RestaurantSearchDTO searchDTO) {
        List<RestaurantSearchResultDTO> results = restaurantSearchService.searchRestaurants(searchDTO);
        return ResponseEntity.ok(results);
    }
} 