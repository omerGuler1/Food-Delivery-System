package com.hufds.service;

import com.hufds.entity.BusinessHours;
import com.hufds.entity.Courier;
import com.hufds.entity.Restaurant;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface RestaurantService {
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

    /**
     * Gets all available couriers for a restaurant
     * @param restaurantId ID of the restaurant
     * @return List of available couriers
     */
    List<Courier> getAvailableCouriers(Integer restaurantId);

    /**
     * Assigns a courier to an order
     * @param restaurantId ID of the restaurant
     * @param orderId ID of the order
     * @param courierId ID of the courier
     * @return The updated order
     */
    Object assignCourierToOrder(Integer restaurantId, Integer orderId, Integer courierId);

    Restaurant uploadProfileImage(Integer restaurantId, MultipartFile image);
} 