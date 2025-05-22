package com.hufds.controller;

import com.hufds.dto.RestaurantConfigDTO;
import com.hufds.entity.Restaurant;
import com.hufds.service.RestaurantConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/restaurants/{restaurantId}/config")
public class RestaurantConfigController {

    @Autowired
    private RestaurantConfigService restaurantConfigService;

    @PutMapping("/delivery-range")
    public ResponseEntity<Restaurant> updateDeliveryRange(
            @PathVariable Integer restaurantId,
            @RequestBody RestaurantConfigDTO configDTO) {
        Restaurant restaurant = restaurantConfigService.updateDeliveryRange(restaurantId, configDTO);
        return ResponseEntity.ok(restaurant);
    }

    @GetMapping("/delivery-range")
    public ResponseEntity<Map<String, Integer>> getDeliveryRange(@PathVariable Integer restaurantId) {
        Integer deliveryRangeKm = restaurantConfigService.getDeliveryRange(restaurantId);
        Map<String, Integer> response = new HashMap<>();
        response.put("deliveryRangeKm", deliveryRangeKm);
        return ResponseEntity.ok(response);
    }
} 