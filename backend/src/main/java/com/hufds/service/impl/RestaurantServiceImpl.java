package com.hufds.service.impl;

import com.hufds.entity.BusinessHours;
import com.hufds.entity.Courier;
import com.hufds.entity.Order;
import com.hufds.entity.Restaurant;
import com.hufds.exception.CustomException;
import com.hufds.repository.CourierRepository;
import com.hufds.repository.OrderRepository;
import com.hufds.repository.RestaurantRepository;
import com.hufds.service.RestaurantService;
import com.hufds.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class RestaurantServiceImpl implements RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private CourierRepository courierRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Override
    public Restaurant getRestaurantById(Integer id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        
        // When accessed by customers, check if restaurant is approved and not deleted
        if (restaurant.getApprovalStatus() != Restaurant.ApprovalStatus.ACCEPTED) {
            throw new CustomException("Restaurant is not available", HttpStatus.NOT_FOUND);
        }
        
        if (restaurant.getDeletedAt() != null) {
            throw new CustomException("Restaurant is not available", HttpStatus.NOT_FOUND);
        }
        
        return restaurant;
    }

    /**
     * Admin version of getRestaurantById that doesn't filter based on approval status or deleted status
     */
    @Override
    public Restaurant getRestaurantByIdForAdmin(Integer id) {
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
        System.out.println("Current day: " + currentDay);
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

    @Override
    public List<Courier> getAvailableCouriers(Integer restaurantId) {
        // Verify restaurant exists
        Restaurant restaurant = getRestaurantById(restaurantId);
        
        // Get all available couriers
        return courierRepository.findByStatus(Courier.CourierStatus.AVAILABLE);
    }

    @Override
    @Transactional
    public Object assignCourierToOrder(Integer restaurantId, Integer orderId, Integer courierId) {
        // This method is deprecated. Use CourierAssignmentService instead.
        throw new CustomException("This method is deprecated. Please use CourierAssignmentService to request a courier.", HttpStatus.BAD_REQUEST);
    }

    @Override
    @Transactional
    public Restaurant uploadProfileImage(Integer restaurantId, MultipartFile image) {
        Restaurant restaurant = getRestaurantById(restaurantId);
        if (image.isEmpty()) {
            throw new CustomException("Please select an image to upload", HttpStatus.BAD_REQUEST);
        }
        String contentType = image.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new CustomException("Only image files are allowed", HttpStatus.BAD_REQUEST);
        }
        if (image.getSize() > 5 * 1024 * 1024) {
            throw new CustomException("Image size must be less than 5MB", HttpStatus.BAD_REQUEST);
        }
        if (restaurant.getProfileImageUrl() != null) {
            fileStorageService.deleteFile(restaurant.getProfileImageUrl());
        }
        String imageUrl = fileStorageService.storeFile(image, "restaurant-profiles");
        restaurant.setProfileImageUrl(imageUrl);
        return restaurantRepository.save(restaurant);
    }

    @Override
    public Restaurant updateApprovalStatus(Integer restaurantId, Restaurant.ApprovalStatus approvalStatus) {
        Restaurant restaurant = getRestaurantById(restaurantId);
        restaurant.setApprovalStatus(approvalStatus);
        return restaurantRepository.save(restaurant);
    }
} 