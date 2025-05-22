package com.hufds.service.impl;

import com.hufds.dto.CustomerAnalyticsDTO;
import com.hufds.dto.RestaurantAnalyticsDTO;
import com.hufds.entity.Customer;
import com.hufds.entity.Order;
import com.hufds.entity.Restaurant;
import com.hufds.repository.CustomerRepository;
import com.hufds.repository.OrderRepository;
import com.hufds.repository.RestaurantRepository;
import com.hufds.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Override
    public List<RestaurantAnalyticsDTO> getRestaurantAnalytics() {
        List<Restaurant> restaurants = restaurantRepository.findAll();
        List<Order> allOrders = orderRepository.findAll();

        // Group orders by restaurant
        Map<Integer, List<Order>> ordersByRestaurant = allOrders.stream()
                .collect(Collectors.groupingBy(order -> order.getRestaurant().getRestaurantId()));

        List<RestaurantAnalyticsDTO> analyticsResults = new ArrayList<>();

        for (Restaurant restaurant : restaurants) {
            List<Order> restaurantOrders = ordersByRestaurant.getOrDefault(restaurant.getRestaurantId(), new ArrayList<>());
            int orderCount = restaurantOrders.size();
            
            // Calculate total revenue
            BigDecimal totalRevenue = restaurantOrders.stream()
                    .map(Order::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Calculate average order value
            Float averageOrderValue = 0f;
            if (orderCount > 0) {
                averageOrderValue = totalRevenue.divide(new BigDecimal(orderCount), 2, RoundingMode.HALF_UP).floatValue();
            }
            
            RestaurantAnalyticsDTO analyticsDTO = RestaurantAnalyticsDTO.builder()
                    .restaurantId(restaurant.getRestaurantId())
                    .restaurantName(restaurant.getName())
                    .totalOrders(orderCount)
                    .totalRevenue(totalRevenue)
                    .averageOrderValue(averageOrderValue)
                    .build();
            
            analyticsResults.add(analyticsDTO);
        }

        return analyticsResults;
    }

    @Override
    public List<CustomerAnalyticsDTO> getCustomerAnalytics() {
        List<Customer> customers = customerRepository.findAll();
        List<Order> allOrders = orderRepository.findAll();

        // Group orders by customer
        Map<Integer, List<Order>> ordersByCustomer = allOrders.stream()
                .collect(Collectors.groupingBy(order -> order.getCustomer().getCustomerId()));

        List<CustomerAnalyticsDTO> analyticsResults = new ArrayList<>();

        for (Customer customer : customers) {
            List<Order> customerOrders = ordersByCustomer.getOrDefault(customer.getCustomerId(), new ArrayList<>());
            int orderCount = customerOrders.size();
            
            // Calculate total spent
            BigDecimal totalSpent = customerOrders.stream()
                    .map(Order::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Calculate average order value
            Float averageOrderValue = 0f;
            if (orderCount > 0) {
                averageOrderValue = totalSpent.divide(new BigDecimal(orderCount), 2, RoundingMode.HALF_UP).floatValue();
            }
            
            CustomerAnalyticsDTO analyticsDTO = CustomerAnalyticsDTO.builder()
                    .customerId(customer.getCustomerId())
                    .customerName(customer.getName())
                    .customerEmail(customer.getEmail())
                    .totalOrders(orderCount)
                    .totalSpent(totalSpent)
                    .averageOrderValue(averageOrderValue)
                    .build();
            
            analyticsResults.add(analyticsDTO);
        }

        return analyticsResults;
    }
} 