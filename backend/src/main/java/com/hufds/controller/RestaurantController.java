package com.hufds.controller;

import com.hufds.entity.BusinessHours;
import com.hufds.entity.Courier;
import com.hufds.entity.Restaurant;
import com.hufds.entity.Order;
import com.hufds.entity.Order.OrderStatus;
import com.hufds.service.RestaurantService;
import com.hufds.service.CourierAssignmentService;
import com.hufds.service.OrderService;
import com.hufds.dto.CourierAssignmentDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private CourierAssignmentService courierAssignmentService;

    @Autowired
    private OrderService orderService;

    @PutMapping("/{id}/status")
    public ResponseEntity<BusinessHours> updateRestaurantStatus(
            @PathVariable Integer id,
            @RequestParam Boolean isClosed) {
        BusinessHours updatedHours = restaurantService.updateRestaurantStatus(id, isClosed);
        return ResponseEntity.ok(updatedHours);
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<Boolean> getRestaurantStatus(@PathVariable Integer id) {
        Boolean isClosed = restaurantService.isRestaurantClosed(id);
        return ResponseEntity.ok(isClosed);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Restaurant> updateRestaurant(
            @PathVariable Integer id,
            @RequestBody Restaurant restaurantDetails) {
        Restaurant updatedRestaurant = restaurantService.updateRestaurant(id, restaurantDetails);
        return ResponseEntity.ok(updatedRestaurant);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getRestaurant(@PathVariable Integer id) {
        Restaurant restaurant = restaurantService.getRestaurantById(id);
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
        CourierAssignmentDTO assignmentDTO = new CourierAssignmentDTO();
        assignmentDTO.setOrderId(orderId);
        assignmentDTO.setCourierId(courierId);
        return ResponseEntity.ok(courierAssignmentService.assignOrderToCourier(assignmentDTO));
    }

    @GetMapping("/{restaurantId}/orders")
    public ResponseEntity<List<Order>> getRestaurantOrders(
            @PathVariable Integer restaurantId,
            @RequestParam(required = false) OrderStatus status) {
        if (status != null) {
            return ResponseEntity.ok(orderService.getRestaurantOrders(restaurantId, status));
        }
        return ResponseEntity.ok(orderService.getAllRestaurantOrders(restaurantId));
    }
} 