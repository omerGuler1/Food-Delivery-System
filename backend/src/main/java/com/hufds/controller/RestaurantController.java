package com.hufds.controller;

import com.hufds.entity.BusinessHours;
import com.hufds.entity.Restaurant;
import com.hufds.service.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @PutMapping("/{id}/status")
    public ResponseEntity<BusinessHours> updateRestaurantStatus(
            @PathVariable Integer id,
            @RequestParam Boolean isClosed) {
        BusinessHours updatedHours = restaurantService.updateRestaurantStatus(id, isClosed);
        return ResponseEntity.ok(updatedHours);
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<Boolean> getRestaurantStatus(@PathVariable Integer id) {
        Boolean isClosed = restaurantService.isRestaurantClosed(id);
        return ResponseEntity.ok(isClosed);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Restaurant> updateRestaurant(
            @PathVariable Integer id,
            @RequestBody Restaurant restaurantDetails) {
        Restaurant updatedRestaurant = restaurantService.updateRestaurant(id, restaurantDetails);
        return ResponseEntity.ok(updatedRestaurant);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getRestaurant(@PathVariable Integer id) {
        Restaurant restaurant = restaurantService.getRestaurantById(id);
        return ResponseEntity.ok(restaurant);
    }
} 