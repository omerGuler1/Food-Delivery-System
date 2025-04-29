package com.hufds.controller;

import com.hufds.dto.CourierOrderHistoryDTO;
import com.hufds.service.CourierAssignmentService;
import com.hufds.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courier")
@RequiredArgsConstructor
public class CourierOrderController {

    private final CourierAssignmentService courierAssignmentService;
    private final JwtService jwtService;

    @GetMapping("/orders")
    public ResponseEntity<List<CourierOrderHistoryDTO>> getCourierOrders(HttpServletRequest request) {
        validateUserRole("courier");
        String token = extractToken(request);
        Integer courierId = jwtService.extractUserId(token);

        List<CourierOrderHistoryDTO> orders = courierAssignmentService.getCourierOrderHistory(courierId);
        return ResponseEntity.ok(orders);
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