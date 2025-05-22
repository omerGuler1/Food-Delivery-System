package com.hufds.controller;

import com.hufds.dto.CustomerAnalyticsDTO;
import com.hufds.dto.RestaurantAnalyticsDTO;
import com.hufds.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/analytics")
public class AdminAnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/restaurants")
    public ResponseEntity<List<RestaurantAnalyticsDTO>> getRestaurantAnalytics() {
        return ResponseEntity.ok(analyticsService.getRestaurantAnalytics());
    }

    @GetMapping("/customers")
    public ResponseEntity<List<CustomerAnalyticsDTO>> getCustomerAnalytics() {
        return ResponseEntity.ok(analyticsService.getCustomerAnalytics());
    }
} 