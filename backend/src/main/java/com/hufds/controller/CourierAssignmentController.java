package com.hufds.controller;

import com.hufds.dto.CourierAssignmentDTO;
import com.hufds.dto.CourierOrderHistoryDTO;
import com.hufds.entity.CourierAssignment;
import com.hufds.service.CourierAssignmentService;
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
@RequestMapping("/api/courier-assignments")
@RequiredArgsConstructor
public class CourierAssignmentController {

    private final CourierAssignmentService assignmentService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<CourierAssignment> assignOrderToCourier(
            @Valid @RequestBody CourierAssignmentDTO assignmentDTO,
            HttpServletRequest request) {
        
        validateUserRole("restaurant");
        String token = extractToken(request);
        Integer restaurantId = jwtService.extractUserId(token);

        CourierAssignment assignment = assignmentService.assignOrderToCourier(assignmentDTO);
        return ResponseEntity.ok(assignment);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<CourierAssignment> updateAssignmentStatus(
            @PathVariable Integer id,
            @RequestParam CourierAssignment.AssignmentStatus status,
            HttpServletRequest request) {
        
        String token = extractToken(request);
        String userType = jwtService.extractUserType(token);

        if (!userType.equalsIgnoreCase("courier")) {
            throw new RuntimeException("Only couriers can update assignment status");
        }

        CourierAssignment assignment = assignmentService.updateAssignmentStatus(id, status);
        return ResponseEntity.ok(assignment);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourierAssignment> getAssignmentById(
            @PathVariable Integer id,
            HttpServletRequest request) {
        
        String token = extractToken(request);
        String userType = jwtService.extractUserType(token);

        if (!userType.equalsIgnoreCase("restaurant") && !userType.equalsIgnoreCase("courier")) {
            throw new RuntimeException("Access denied");
        }

        CourierAssignment assignment = assignmentService.getAssignmentById(id);
        return ResponseEntity.ok(assignment);
    }

    @GetMapping("/courier/history")
    public ResponseEntity<List<CourierOrderHistoryDTO>> getCourierOrderHistory(HttpServletRequest request) {
        validateUserRole("courier");
        String token = extractToken(request);
        Integer courierId = jwtService.extractUserId(token);

        List<CourierOrderHistoryDTO> history = assignmentService.getCourierOrderHistory(courierId);
        return ResponseEntity.ok(history);
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