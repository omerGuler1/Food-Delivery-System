package com.hufds.controller;

import com.hufds.entity.Restaurant;
import com.hufds.service.FavoriteRestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteRestaurantController {

    private final FavoriteRestaurantService favoriteRestaurantService;

    @GetMapping
    public ResponseEntity<List<Restaurant>> getFavoriteRestaurants() {
        return ResponseEntity.ok(favoriteRestaurantService.getCurrentUserFavoriteRestaurants());
    }

    @PostMapping("/{restaurantId}")
    public ResponseEntity<Void> addFavoriteRestaurant(@PathVariable Integer restaurantId) {
        favoriteRestaurantService.addFavoriteRestaurant(restaurantId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{restaurantId}")
    public ResponseEntity<Void> removeFavoriteRestaurant(@PathVariable Integer restaurantId) {
        favoriteRestaurantService.removeFavoriteRestaurant(restaurantId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{restaurantId}/status")
    public ResponseEntity<Map<String, Boolean>> checkFavoriteStatus(@PathVariable Integer restaurantId) {
        boolean isFavorite = favoriteRestaurantService.isRestaurantFavorited(restaurantId);
        return ResponseEntity.ok(Map.of("isFavorite", isFavorite));
    }
} 