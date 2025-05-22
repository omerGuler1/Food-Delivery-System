package com.hufds.service.impl;

import com.hufds.entity.Address;
import com.hufds.entity.Restaurant;
import com.hufds.exception.CustomException;
import com.hufds.repository.AddressRepository;
import com.hufds.repository.RestaurantRepository;
import com.hufds.service.DeliveryRangeService;
import com.hufds.util.GeolocationUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DeliveryRangeServiceImpl implements DeliveryRangeService {

    private static final Logger log = LoggerFactory.getLogger(DeliveryRangeServiceImpl.class);
    private final RestaurantRepository restaurantRepository;
    private final AddressRepository addressRepository;

    @Override
    public boolean isAddressWithinDeliveryRange(Integer restaurantId, Integer addressId) {
        log.info("Checking if address ID {} is within delivery range of restaurant ID {}", addressId, restaurantId);
        
        double distance = getDistanceToRestaurant(restaurantId, addressId);
        if (distance < 0) {
            // Could not calculate distance, assume not in range
            log.warn("Could not calculate distance between restaurant ID {} and address ID {}, assuming not in range", 
                     restaurantId, addressId);
            return false;
        }
        
        boolean result = isDistanceWithinRange(restaurantId, distance);
        log.info("Address ID {} is {} delivery range of restaurant ID {} (distance: {}km)", 
                 addressId, result ? "within" : "outside", restaurantId, distance);
        return result;
    }

    @Override
    public double getDistanceToRestaurant(Integer restaurantId, Integer addressId) {
        Restaurant restaurant = getRestaurantById(restaurantId);
        Address address = getAddressById(addressId);
        
        log.info("Calculating distance: Restaurant ID {} coordinates: ({}, {}), Address ID {} coordinates: ({}, {})",
                 restaurantId, restaurant.getLatitude(), restaurant.getLongitude(),
                 addressId, address.getLatitude(), address.getLongitude());
        
        // Check if both entities have coordinates
        if (restaurant.getLatitude() == null || restaurant.getLongitude() == null ||
            address.getLatitude() == null || address.getLongitude() == null) {
            log.warn("Missing coordinates - Restaurant: ({}, {}), Address: ({}, {})",
                     restaurant.getLatitude(), restaurant.getLongitude(),
                     address.getLatitude(), address.getLongitude());
            return -1; // Cannot calculate distance without coordinates
        }
        
        double distance = GeolocationUtil.calculateDistance(
            restaurant.getLatitude(),
            restaurant.getLongitude(),
            address.getLatitude(),
            address.getLongitude()
        );
        
        log.info("Distance between restaurant ID {} and address ID {}: {}km", 
                 restaurantId, addressId, distance);
        return distance;
    }
    
    @Override
    public double getDistanceBetweenCoordinates(Integer restaurantId, BigDecimal latitude, BigDecimal longitude) {
        Restaurant restaurant = getRestaurantById(restaurantId);
        
        log.info("Calculating distance: Restaurant ID {} coordinates: ({}, {}), Target coordinates: ({}, {})",
                 restaurantId, restaurant.getLatitude(), restaurant.getLongitude(), latitude, longitude);
        
        // Check if restaurant has coordinates and provided coordinates are not null
        if (restaurant.getLatitude() == null || restaurant.getLongitude() == null ||
            latitude == null || longitude == null) {
            log.warn("Missing coordinates - Restaurant: ({}, {}), Target: ({}, {})",
                     restaurant.getLatitude(), restaurant.getLongitude(), latitude, longitude);
            return -1; // Cannot calculate distance without coordinates
        }
        
        double distance = GeolocationUtil.calculateDistance(
            restaurant.getLatitude(),
            restaurant.getLongitude(),
            latitude,
            longitude
        );
        
        log.info("Distance between restaurant ID {} and coordinates ({}, {}): {}km", 
                 restaurantId, latitude, longitude, distance);
        return distance;
    }
    
    @Override
    public boolean isDistanceWithinRange(Integer restaurantId, double distanceInKm) {
        if (distanceInKm < 0) {
            // Invalid distance, assume not in range
            log.warn("Invalid distance value ({}km) for restaurant ID {}, assuming not in range", 
                     distanceInKm, restaurantId);
            return false;
        }
        
        Restaurant restaurant = getRestaurantById(restaurantId);
        Integer deliveryRange = restaurant.getDeliveryRangeKm();
        
        log.info("Checking if distance {}km is within restaurant ID {}'s delivery range: {}km", 
                 distanceInKm, restaurantId, deliveryRange);
        
        if (deliveryRange == null) {
            // If restaurant doesn't have a delivery range set, use a default value
            log.info("Restaurant ID {} has no delivery range set, using default behavior (allow delivery)", 
                     restaurantId);
            return true;
        }
        
        boolean result = distanceInKm <= deliveryRange;
        log.info("Distance {}km is {} restaurant ID {}'s delivery range of {}km", 
                 distanceInKm, result ? "within" : "outside", restaurantId, deliveryRange);
        return result;
    }
    
    private Restaurant getRestaurantById(Integer restaurantId) {
        return restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new CustomException("Restaurant not found", HttpStatus.NOT_FOUND));
    }
    
    private Address getAddressById(Integer addressId) {
        return addressRepository.findById(addressId)
                .orElseThrow(() -> new CustomException("Address not found", HttpStatus.NOT_FOUND));
    }
} 