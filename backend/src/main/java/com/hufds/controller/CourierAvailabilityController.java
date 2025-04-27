package com.hufds.controller;

import com.hufds.dto.CourierAvailabilityDTO;
import com.hufds.entity.Courier;
import com.hufds.service.CourierAvailabilityService;
import com.hufds.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/couriers")
@RequiredArgsConstructor
public class CourierAvailabilityController {

    private final CourierAvailabilityService courierAvailabilityService;
    private final JwtService jwtService;

    @PutMapping("/{id}/availability")
    public ResponseEntity<Courier> updateAvailability(
            @PathVariable Integer id,
            @Valid @RequestBody CourierAvailabilityDTO availabilityDTO,
            HttpServletRequest request) {
        
        validateUserRole("courier");
        String token = extractToken(request);
        Integer courierId = jwtService.extractUserId(token);

        // Ensure courier can only update their own availability
        if (!courierId.equals(id)) {
            throw new RuntimeException("You can only update your own availability");
        }

        Courier updatedCourier = courierAvailabilityService.updateAvailability(id, availabilityDTO);
        return ResponseEntity.ok(updatedCourier);
    }

    @GetMapping("/available")
    public ResponseEntity<List<Courier>> getAvailableCouriers(HttpServletRequest request) {
        validateUserRole("restaurant");
        String token = extractToken(request);
        
        List<Courier> availableCouriers = courierAvailabilityService.getAvailableCouriers();
        return ResponseEntity.ok(availableCouriers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Courier> getCourierById(
            @PathVariable Integer id,
            HttpServletRequest request) {
        
        String token = extractToken(request);
        String userType = jwtService.extractUserType(token);

        // Only restaurants and couriers can view courier details
        if (!userType.equalsIgnoreCase("restaurant") && !userType.equalsIgnoreCase("courier")) {
            throw new RuntimeException("Access denied");
        }

        // If courier, ensure they can only view their own details
        if (userType.equalsIgnoreCase("courier")) {
            Integer courierId = jwtService.extractUserId(token);
            if (!courierId.equals(id)) {
                throw new RuntimeException("You can only view your own details");
            }
        }

        Courier courier = courierAvailabilityService.getCourierById(id);
        return ResponseEntity.ok(courier);
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