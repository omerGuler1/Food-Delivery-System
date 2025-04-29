package com.hufds.service;

import com.hufds.entity.BusinessHours;
import com.hufds.entity.Restaurant;

import java.util.List;

public interface RestaurantService {
    /**
     * Updates the open/closed status of a restaurant for the current day
     * @param restaurantId ID of the restaurant
     * @param isClosed true if restaurant should be closed, false if open
     * @return Updated BusinessHours
     */
    BusinessHours updateRestaurantStatus(Integer restaurantId, Boolean isClosed);

    /**
     * Gets the current open/closed status of a restaurant
     * @param restaurantId ID of the restaurant
     * @return true if restaurant is closed, false if open
     */
    Boolean isRestaurantClosed(Integer restaurantId);

    /**
     * Gets a restaurant by ID
     * @param id Restaurant ID
     * @return Restaurant entity
     */
    Restaurant getRestaurantById(Integer id);

    /**
     * Updates a restaurant's details
     * @param id Restaurant ID
     * @param restaurantDetails Updated restaurant details
     * @return Updated Restaurant entity
     */
    Restaurant updateRestaurant(Integer id, Restaurant restaurantDetails);
} 