package com.hufds.controller;

import com.hufds.entity.BusinessHours;
import com.hufds.entity.Courier;
import com.hufds.entity.Restaurant;
import com.hufds.entity.Order;
import com.hufds.entity.Order.OrderStatus;
import com.hufds.service.RestaurantService;
import com.hufds.service.CourierAssignmentService;
import com.hufds.service.OrderService;
import com.hufds.service.RestaurantConfigService;
import com.hufds.dto.CourierAssignmentDTO;
import com.hufds.dto.CourierAssignmentRequestDTO;
import com.hufds.dto.OrderResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import java.util.HashMap;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private CourierAssignmentService courierAssignmentService;

    @Autowired
    private OrderService orderService;
    
    @Autowired
    private RestaurantConfigService restaurantConfigService;

    @GetMapping("/verify")
    public ResponseEntity<Void> verifyRestaurantExists() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        // Check if the restaurant with this email exists
        Optional<Restaurant> restaurant = restaurantService.findByEmail(email);
        if (restaurant.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        
        // If we get here, the restaurant exists
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/open-status")
    public ResponseEntity<Map<String, Boolean>> getRestaurantOpenStatus(@PathVariable Integer id) {
        boolean isOpen = restaurantConfigService.isRestaurantOpen(id);
        Map<String, Boolean> response = new HashMap<>();
        response.put("isOpen", isOpen);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Restaurant> updateRestaurant(
            @PathVariable Integer id,
            @RequestBody Restaurant restaurantDetails) {
        // Use the regular method - it will throw an exception if the restaurant doesn't exist
        // or is not in ACCEPTED status (which is fine because we don't want to update 
        // non-approved restaurants through this endpoint)
        Restaurant updatedRestaurant = restaurantService.updateRestaurant(id, restaurantDetails);
        return ResponseEntity.ok(updatedRestaurant);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getRestaurant(
            @PathVariable Integer id, 
            @RequestHeader(name = "Authorization", required = false) String authHeader) {
        
        // If this is an admin request, use the admin version that doesn't filter by status
        boolean isAdminRequest = authHeader != null && authHeader.contains("ROLE_admin");
        
        Restaurant restaurant;
        if (isAdminRequest) {
            restaurant = restaurantService.getRestaurantByIdForAdmin(id);
        } else {
            // For regular customers, only return approved, non-deleted restaurants
            restaurant = restaurantService.getRestaurantById(id);
        }
        
        return ResponseEntity.ok(restaurant);
    }

    @GetMapping("/{restaurantId}/available-couriers")
    public ResponseEntity<List<Courier>> getAvailableCouriers(@PathVariable Integer restaurantId) {
        return ResponseEntity.ok(restaurantService.getAvailableCouriers(restaurantId));
    }

    @PostMapping("/{restaurantId}/orders/{orderId}/request-courier/{courierId}")
    public ResponseEntity<?> requestCourierForOrder(
            @PathVariable Integer restaurantId,
            @PathVariable Integer orderId,
            @PathVariable Integer courierId) {
        CourierAssignmentRequestDTO assignmentDTO = CourierAssignmentRequestDTO.builder()
            .orderId(orderId)
            .courierId(courierId)
            .build();
        return ResponseEntity.ok(courierAssignmentService.assignOrderToCourier(assignmentDTO));
    }

    @GetMapping("/{restaurantId}/orders")
    public ResponseEntity<List<OrderResponseDTO>> getRestaurantOrders(
            @PathVariable Integer restaurantId,
            @RequestParam(required = false) OrderStatus status) {
        
        List<Order> orders;
        if (status != null) {
            orders = orderService.getRestaurantOrders(restaurantId, status);
        } else {
            orders = orderService.getAllRestaurantOrders(restaurantId);
        }
        
        // Convert Order entities to OrderResponseDTO
        List<OrderResponseDTO> orderDTOs = orders.stream()
                .map(OrderResponseDTO::fromOrder)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(orderDTOs);
    }

    @PostMapping(value = "/{restaurantId}/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Restaurant> uploadProfileImage(
            @PathVariable Integer restaurantId,
            @RequestParam("image") MultipartFile image) {
        return ResponseEntity.ok(restaurantService.uploadProfileImage(restaurantId, image));
    }

    @GetMapping("/{restaurantId}/approval-status")
    public ResponseEntity<?> checkApprovalStatus(@PathVariable Integer restaurantId) {
        Restaurant restaurant = restaurantService.getRestaurantById(restaurantId);
        
        return ResponseEntity.ok(Map.of(
                "restaurantId", restaurant.getRestaurantId(),
                "approvalStatus", restaurant.getApprovalStatus()
        ));
    }
} 