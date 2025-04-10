package com.hufds.controller;

import com.hufds.entity.Restaurant;
import com.hufds.service.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {
    
    private final RestaurantService restaurantService;

    @Autowired
    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }

    @GetMapping
    public List<Restaurant> getAllRestaurants() {
        return restaurantService.getAllRestaurants();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getRestaurantById(@PathVariable Long id) {
        return restaurantService.getRestaurantById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<Restaurant> searchRestaurants(@RequestParam String name) {
        return restaurantService.searchRestaurants(name);
    }

    @GetMapping("/cuisine/{type}")
    public List<Restaurant> getRestaurantsByCuisine(@PathVariable String type) {
        return restaurantService.getRestaurantsByCuisine(type);
    }

    @PostMapping
    public Restaurant createRestaurant(@RequestBody Restaurant restaurant) {
        return restaurantService.createRestaurant(restaurant);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Restaurant> updateRestaurant(@PathVariable Long id, @RequestBody Restaurant restaurant) {
        return restaurantService.getRestaurantById(id)
                .map(existingRestaurant -> {
                    restaurant.setRestaurantId(id);
                    return ResponseEntity.ok(restaurantService.updateRestaurant(restaurant));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRestaurant(@PathVariable Long id) {
        if (restaurantService.getRestaurantById(id).isPresent()) {
            restaurantService.deleteRestaurant(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
} 