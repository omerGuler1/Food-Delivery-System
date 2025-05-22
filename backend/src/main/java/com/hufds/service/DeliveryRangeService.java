package com.hufds.service;

import java.math.BigDecimal;

public interface DeliveryRangeService {
    /**
     * Check if the given address is within the delivery range of the restaurant
     * 
     * @param restaurantId the restaurant ID
     * @param addressId the address ID
     * @return true if the address is within delivery range, false otherwise
     */
    boolean isAddressWithinDeliveryRange(Integer restaurantId, Integer addressId);
    
    /**
     * Get the distance between a restaurant and an address in kilometers
     * 
     * @param restaurantId the restaurant ID
     * @param addressId the address ID
     * @return distance in kilometers, or -1 if the calculation fails
     */
    double getDistanceToRestaurant(Integer restaurantId, Integer addressId);
    
    /**
     * Get the distance between a restaurant and specified coordinates
     * 
     * @param restaurantId the restaurant ID
     * @param latitude the latitude coordinate
     * @param longitude the longitude coordinate
     * @return distance in kilometers, or -1 if the calculation fails
     */
    double getDistanceBetweenCoordinates(Integer restaurantId, BigDecimal latitude, BigDecimal longitude);
    
    /**
     * Check if a specific distance is within a restaurant's delivery range
     * 
     * @param restaurantId the restaurant ID
     * @param distanceInKm the distance in kilometers
     * @return true if the distance is within range, false otherwise
     */
    boolean isDistanceWithinRange(Integer restaurantId, double distanceInKm);
} 