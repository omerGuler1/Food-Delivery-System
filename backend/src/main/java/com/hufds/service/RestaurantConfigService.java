package com.hufds.service;

import com.hufds.dto.BusinessHoursDTO;
import com.hufds.dto.RestaurantConfigDTO;
import com.hufds.entity.BusinessHours;
import com.hufds.entity.Restaurant;

import java.util.List;

public interface RestaurantConfigService {
    // Business Hours Management
    BusinessHours addBusinessHours(Integer restaurantId, BusinessHoursDTO businessHoursDTO);
    BusinessHours updateBusinessHours(Integer hoursId, BusinessHoursDTO businessHoursDTO, Integer restaurantId);
    void deleteBusinessHours(Integer hoursId, Integer restaurantId);
    List<BusinessHours> getBusinessHours(Integer restaurantId);
    BusinessHours getBusinessHoursById(Integer hoursId, Integer restaurantId);
    
    // Delivery Range Management
    Restaurant updateDeliveryRange(Integer restaurantId, RestaurantConfigDTO configDTO);
    Integer getDeliveryRange(Integer restaurantId);
    
    // Business Hours Validation
    boolean isRestaurantOpen(Integer restaurantId);
} 