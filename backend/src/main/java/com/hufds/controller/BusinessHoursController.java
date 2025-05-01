package com.hufds.controller;

import com.hufds.dto.BusinessHoursDTO;
import com.hufds.entity.BusinessHours;
import com.hufds.service.RestaurantConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants/{restaurantId}/business-hours")
public class BusinessHoursController {

    @Autowired
    private RestaurantConfigService restaurantConfigService;

    @PostMapping
    public ResponseEntity<BusinessHours> addBusinessHours(
            @PathVariable Integer restaurantId,
            @RequestBody BusinessHoursDTO businessHoursDTO) {
        BusinessHours businessHours = restaurantConfigService.addBusinessHours(restaurantId, businessHoursDTO);
        return ResponseEntity.ok(businessHours);
    }

    @PutMapping("/{hoursId}")
    public ResponseEntity<BusinessHours> updateBusinessHours(
            @PathVariable Integer restaurantId,
            @PathVariable Integer hoursId,
            @RequestBody BusinessHoursDTO businessHoursDTO) {
        BusinessHours businessHours = restaurantConfigService.updateBusinessHours(hoursId, businessHoursDTO, restaurantId);
        return ResponseEntity.ok(businessHours);
    }

    @DeleteMapping("/{hoursId}")
    public ResponseEntity<Void> deleteBusinessHours(
            @PathVariable Integer restaurantId,
            @PathVariable Integer hoursId) {
        restaurantConfigService.deleteBusinessHours(hoursId, restaurantId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<BusinessHours>> getBusinessHours(
            @PathVariable Integer restaurantId) {
        List<BusinessHours> businessHours = restaurantConfigService.getBusinessHours(restaurantId);
        return ResponseEntity.ok(businessHours);
    }
} 