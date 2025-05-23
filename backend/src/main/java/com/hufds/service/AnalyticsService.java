package com.hufds.service;

import com.hufds.dto.CustomerAnalyticsDTO;
import com.hufds.dto.RestaurantAnalyticsDTO;

import java.util.List;

public interface AnalyticsService {
    List<RestaurantAnalyticsDTO> getRestaurantAnalytics();
    List<CustomerAnalyticsDTO> getCustomerAnalytics();
} 