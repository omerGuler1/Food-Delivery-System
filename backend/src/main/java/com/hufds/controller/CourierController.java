package com.hufds.controller;

import com.hufds.entity.Courier;
import com.hufds.entity.Order;
import com.hufds.service.CourierService;
import com.hufds.service.OrderService;
import com.hufds.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courier")
public class CourierController {

    @Autowired
    private CourierService courierService;
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private JwtService jwtService;

    @GetMapping("/profile/{courierId}")
    public ResponseEntity<Courier> getCourierProfile(@PathVariable Integer courierId) {
        return ResponseEntity.ok(courierService.getCourierProfile(courierId));
    }

    @PutMapping("/profile/{courierId}")
    public ResponseEntity<Courier> updateCourierProfile(
            @PathVariable Integer courierId,
            @RequestBody Courier courier) {
        return ResponseEntity.ok(courierService.updateCourierProfile(courierId, courier));
    }

    @PutMapping("/status/{courierId}")
    public ResponseEntity<Void> updateCourierStatus(
            @PathVariable Integer courierId,
            @RequestParam Courier.CourierStatus status) {
        courierService.updateCourierStatus(courierId, status);
        return ResponseEntity.ok().build();
    }

    /**
     * Get active delivery orders for a courier with restaurant and customer details.
     * These are orders with status OUT_FOR_DELIVERY that are assigned to the courier.
     * 
     * @param courierId The courier ID
     * @param request HTTP request containing the authorization token
     * @return List of active orders with related data
     */
    @GetMapping("/orders/active/{courierId}")
    public ResponseEntity<List<Order>> getActiveDeliveries(
            @PathVariable Integer courierId,
            HttpServletRequest request) {
        
        validateUserRole("courier");
        String token = extractToken(request);
        Integer authenticatedCourierId = jwtService.extractUserId(token);
        
        // Ensure couriers can only see their own active deliveries
        if (!authenticatedCourierId.equals(courierId)) {
            throw new RuntimeException("You can only view your own active deliveries");
        }
        
        // Get orders with OUT_FOR_DELIVERY status assigned to this courier
        // Using the enhanced service that includes restaurant and customer details
        List<Order> activeOrders = orderService.getActiveCourierOrders(courierId);
        
        return ResponseEntity.ok(activeOrders);
    }

    @GetMapping("/orders/past/{courierId}")
    public ResponseEntity<List<Order>> getPastDeliveries(@PathVariable Integer courierId) {
        return ResponseEntity.ok(courierService.getPastDeliveries(courierId));
    }

    @PostMapping("/orders/{orderId}/complete/{courierId}")
    public ResponseEntity<Order> completeDelivery(
            @PathVariable Integer orderId,
            @PathVariable Integer courierId) {
        return ResponseEntity.ok(courierService.completeDelivery(courierId, orderId));
    }

    @PostMapping("/orders/{orderId}/cancel/{courierId}")
    public ResponseEntity<Order> cancelDelivery(
            @PathVariable Integer orderId,
            @PathVariable Integer courierId) {
        return ResponseEntity.ok(courierService.cancelDelivery(courierId, orderId));
    }

    @GetMapping("/earnings/{courierId}")
    public ResponseEntity<Double> getTotalEarnings(@PathVariable Integer courierId) {
        return ResponseEntity.ok(courierService.getTotalEarnings(courierId));
    }

    // Add this new endpoint for checking approval status
    @GetMapping("/{courierId}/approval-status")
    public ResponseEntity<?> checkApprovalStatus(@PathVariable Integer courierId) {
        Courier courier = courierService.getCourierProfile(courierId);
        
        return ResponseEntity.ok(Map.of(
                "courierId", courier.getCourierId(),
                "approvalStatus", courier.getApprovalStatus()
        ));
    }
    
    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        throw new RuntimeException("Missing or invalid Authorization header");
    }

    private void validateUserRole(String requiredRole) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        boolean hasRole = auth != null && auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_" + requiredRole));
        if (!hasRole) {
            throw new RuntimeException("Access denied. Required role: " + requiredRole);
        }
    }
} 