package com.hufds.controller;

import com.hufds.dto.AddressDTO;
import com.hufds.service.DeliveryRangeService;
import com.hufds.service.GeocodingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/restaurants/{restaurantId}/delivery")
public class DeliveryRangeController {

    @Autowired
    private DeliveryRangeService deliveryRangeService;
    
    @Autowired
    private GeocodingService geocodingService;

    @GetMapping("/check/{addressId}")
    public ResponseEntity<Map<String, Object>> checkDeliveryAvailability(
            @PathVariable Integer restaurantId,
            @PathVariable Integer addressId) {
        boolean isInRange = deliveryRangeService.isAddressWithinDeliveryRange(restaurantId, addressId);
        double distance = deliveryRangeService.getDistanceToRestaurant(restaurantId, addressId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("isInRange", isInRange);
        
        if (distance >= 0) {
            response.put("distanceKm", Math.round(distance * 10) / 10.0); // Round to 1 decimal place
        } else {
            response.put("distanceKm", null);
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Check if a given address (without an ID) is within a restaurant's delivery range
     * This is useful for checking new addresses or addresses that aren't saved yet
     */
    @PostMapping("/check-address")
    public ResponseEntity<Map<String, Object>> checkAddressInRange(
            @PathVariable Integer restaurantId,
            @RequestBody AddressDTO address) {
        
        // Get coordinates using geocoding service
        GeocodingService.Coordinates coordinates = geocodingService.geocodeAddress(
                address.getStreet(),
                address.getCity(),
                address.getState(),
                address.getZipCode(),
                address.getCountry()
        );
        
        // Calculate distance using the DeliveryRangeServiceImpl
        double distance = deliveryRangeService.getDistanceBetweenCoordinates(
                restaurantId, 
                coordinates.getLatitude(), 
                coordinates.getLongitude()
        );
        
        // Check if the address is within range
        boolean isInRange = false;
        if (distance >= 0) {
            isInRange = deliveryRangeService.isDistanceWithinRange(restaurantId, distance);
        }
        
        // Build the response
        Map<String, Object> response = new HashMap<>();
        response.put("isInRange", isInRange);
        
        if (distance >= 0) {
            response.put("distanceKm", Math.round(distance * 10) / 10.0); // Round to 1 decimal place
        } else {
            response.put("distanceKm", null);
        }
        
        return ResponseEntity.ok(response);
    }
} 