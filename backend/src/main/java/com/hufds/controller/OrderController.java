package com.hufds.controller;

import com.hufds.dto.PlaceOrderRequestDTO;
import com.hufds.entity.Order;
import com.hufds.exception.CustomException;
import com.hufds.service.JwtService;
import com.hufds.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final JwtService jwtService;
    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    // CREATE
    @PostMapping
    public ResponseEntity<Order> placeOrder(
            @RequestBody PlaceOrderRequestDTO dto,
            HttpServletRequest request) {

        validateUserRole("customer");
        String token = extractToken(request);
        Integer customerId = jwtService.extractUserId(token);
        dto.setCustomerId(customerId);  // override to ensure correctness

        Order createdOrder = orderService.placeOrder(dto);
        return ResponseEntity.ok(createdOrder);
    }

    // READ
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Integer id, HttpServletRequest request) {
        String token = extractToken(request);
        Integer userId = jwtService.extractUserId(token);
        String userType = jwtService.extractUserType(token);

        return orderService.getOrderById(id, userId, userType)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // UPDATE STATUS
    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Integer id,
            @RequestParam Order.OrderStatus status,
            HttpServletRequest request) {

        log.info("Received request to update order status. Order ID: {}, New Status: {}", id, status);

        String token = extractToken(request);
        Integer userId = jwtService.extractUserId(token);
        String userType = jwtService.extractUserType(token);

        if (!userType.equalsIgnoreCase("restaurant") && !userType.equalsIgnoreCase("courier")) {
            throw new CustomException("Only restaurants and couriers can update order status", HttpStatus.FORBIDDEN);
        }

        return ResponseEntity.ok(orderService.updateOrderStatus(id, status, userId, userType));
    }

    // CANCEL ORDER
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable Integer id, HttpServletRequest request) {
        String token = extractToken(request);
        Integer userId = jwtService.extractUserId(token);
        String userType = jwtService.extractUserType(token);

        // Validate user is either a customer or restaurant
        if (!userType.equalsIgnoreCase("customer") && !userType.equalsIgnoreCase("restaurant")) {
            throw new CustomException("Only customers and restaurants can cancel orders", HttpStatus.FORBIDDEN);
        }

        return ResponseEntity.ok(orderService.cancelOrder(id, userId, userType));
    }

    // UTILITY: Extract token from header
    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        throw new CustomException("Missing or invalid Authorization header", HttpStatus.UNAUTHORIZED);
    }

    // UTILITY: Validate user role using Spring Security context
    private void validateUserRole(String requiredRole) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        boolean hasRole = auth != null && auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_" + requiredRole));
        if (!hasRole) {
            throw new CustomException("Access denied. Required role: " + requiredRole, HttpStatus.FORBIDDEN);
        }
    }
}
