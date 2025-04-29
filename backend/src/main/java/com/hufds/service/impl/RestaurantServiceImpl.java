package com.hufds.service.impl;

import com.hufds.entity.BusinessHours;
import com.hufds.entity.Restaurant;
import com.hufds.repository.RestaurantRepository;
import com.hufds.service.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;

@Service
public class RestaurantServiceImpl implements RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Override
    public Restaurant getRestaurantById(Integer id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
    }

    @Override
    public Restaurant updateRestaurant(Integer id, Restaurant restaurantDetails) {
        Restaurant restaurant = getRestaurantById(id);
        
        restaurant.setName(restaurantDetails.getName());
        restaurant.setPhoneNumber(restaurantDetails.getPhoneNumber());
        restaurant.setCuisineType(restaurantDetails.getCuisineType());
        restaurant.setDeliveryRangeKm(restaurantDetails.getDeliveryRangeKm());
        
        return restaurantRepository.save(restaurant);
    }

    @Override
    public BusinessHours updateRestaurantStatus(Integer restaurantId, Boolean isClosed) {
        Restaurant restaurant = getRestaurantById(restaurantId);
        
        LocalDateTime now = LocalDateTime.now();
        DayOfWeek currentDay = now.getDayOfWeek();
        
        // Find business hours for current day
        BusinessHours businessHours = restaurant.getBusinessHours().stream()
                .filter(hours -> hours.getDayOfWeek().equals(currentDay.toString()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Business hours not found for current day"));
        
        businessHours.setIsClosed(isClosed);
        return businessHours;
    }

    @Override
    public Boolean isRestaurantClosed(Integer restaurantId) {
        Restaurant restaurant = getRestaurantById(restaurantId);
        
        LocalDateTime now = LocalDateTime.now();
        DayOfWeek currentDay = now.getDayOfWeek();
        
        // Find business hours for current day
        return restaurant.getBusinessHours().stream()
                .filter(hours -> hours.getDayOfWeek().equals(currentDay.toString()))
                .findFirst()
                .map(BusinessHours::getIsClosed)
                .orElse(true); // If no business hours found, consider restaurant closed
    }
} 