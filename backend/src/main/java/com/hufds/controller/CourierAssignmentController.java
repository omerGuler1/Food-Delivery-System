package com.hufds.controller;

import com.hufds.dto.CourierOrderHistoryDTO;
import com.hufds.entity.CourierAssignment;
import com.hufds.service.CourierAssignmentService;
import com.hufds.service.JwtService;
import com.hufds.exception.CustomException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing courier assignments and delivery requests.
 * Handles courier acceptance/rejection of delivery requests and status updates.
 */
@Slf4j
@RestController
@RequestMapping("/api/courier-assignments")
@RequiredArgsConstructor
public class CourierAssignmentController {

    private final CourierAssignmentService assignmentService;
    private final JwtService jwtService;

    /**
     * Accept a delivery request by a courier.
     * @param id The assignment ID
     * @param request HTTP request containing the authentication token
     * @return The updated courier assignment
     */
    @PostMapping("/{id}/accept")
    public ResponseEntity<CourierAssignment> acceptDeliveryRequest(
            @PathVariable Integer id,
            HttpServletRequest request) {
        
        validateUserRole("courier");
        String token = extractToken(request);
        Integer courierId = jwtService.extractUserId(token);

        CourierAssignment assignment = assignmentService.getAssignmentById(id);
        if (!assignment.getCourier().getCourierId().equals(courierId)) {
            throw new CustomException("This delivery request is not assigned to you", HttpStatus.FORBIDDEN);
        }

        if (assignment.getStatus() != CourierAssignment.AssignmentStatus.REQUESTED) {
            throw new CustomException("Can only accept REQUESTED assignments", HttpStatus.BAD_REQUEST);
        }

        return ResponseEntity.ok(assignmentService.acceptDeliveryRequest(id));
    }

    /**
     * Reject a delivery request by a courier.
     * @param id The assignment ID
     * @param request HTTP request containing the authentication token
     * @return The updated courier assignment
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<CourierAssignment> rejectDeliveryRequest(
            @PathVariable Integer id,
            HttpServletRequest request) {
        
        validateUserRole("courier");
        String token = extractToken(request);
        Integer courierId = jwtService.extractUserId(token);

        CourierAssignment assignment = assignmentService.getAssignmentById(id);
        if (!assignment.getCourier().getCourierId().equals(courierId)) {
            throw new CustomException("This delivery request is not assigned to you", HttpStatus.FORBIDDEN);
        }

        if (assignment.getStatus() != CourierAssignment.AssignmentStatus.REQUESTED) {
            throw new CustomException("Can only reject REQUESTED assignments", HttpStatus.BAD_REQUEST);
        }

        return ResponseEntity.ok(assignmentService.rejectDeliveryRequest(id));
    }

    /**
     * Update the status of a courier assignment.
     * @param id The assignment ID
     * @param status The new status to set
     * @param request HTTP request containing the authentication token
     * @return The updated courier assignment
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<CourierAssignment> updateAssignmentStatus(
            @PathVariable Integer id,
            @RequestParam CourierAssignment.AssignmentStatus status,
            HttpServletRequest request) {
        
        try {
            log.info("Updating assignment status for assignmentId: {}, new status: {}", id, status);
            
            // Extract and validate token
            String token = extractToken(request);
            log.info("Token extracted successfully");
            
            // Get courier ID from token
            Integer courierId = jwtService.extractUserId(token);
            log.info("Courier ID from token: {}", courierId);
            
            // Get user type from token
            String userType = jwtService.extractUserType(token);
            log.info("User type from token: {}", userType);
            
            // Validate user is a courier
            if (!"courier".equalsIgnoreCase(userType)) {
                log.error("User is not a courier. User type: {}", userType);
                throw new CustomException("Only couriers can update assignment status", HttpStatus.FORBIDDEN);
            }

            // Get and validate assignment
            CourierAssignment assignment = assignmentService.getAssignmentById(id);
            log.info("Assignment found: {}", assignment.getAssignmentId());
            
            if (!assignment.getCourier().getCourierId().equals(courierId)) {
                log.error("Assignment courierId: {}, Token courierId: {}", 
                    assignment.getCourier().getCourierId(), courierId);
                throw new CustomException("This assignment is not assigned to you", HttpStatus.FORBIDDEN);
            }

            if (status == null) {
                log.error("Status is null");
                throw new CustomException("Status cannot be null", HttpStatus.BAD_REQUEST);
            }

            // Update the status
            CourierAssignment updatedAssignment = assignmentService.updateAssignmentStatus(id, status);
            log.info("Assignment status updated successfully to: {}", status);
            
            return ResponseEntity.ok(updatedAssignment);
            
        } catch (CustomException e) {
            log.error("Custom exception while updating assignment status: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while updating assignment status: {}", e.getMessage(), e);
            throw new CustomException("An unexpected error occurred while updating assignment status", 
                HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get a specific courier assignment by ID.
     * @param id The assignment ID
     * @param request HTTP request containing the authentication token
     * @return The courier assignment
     */
    @GetMapping("/{id}")
    public ResponseEntity<CourierAssignment> getAssignmentById(
            @PathVariable Integer id,
            HttpServletRequest request) {
        
        String token = extractToken(request);
        String userType = jwtService.extractUserType(token);
        Integer userId = jwtService.extractUserId(token);

        if (!userType.equalsIgnoreCase("restaurant") && !userType.equalsIgnoreCase("courier")) {
            throw new CustomException("Access denied. Only restaurants and couriers can view assignments", HttpStatus.FORBIDDEN);
        }

        CourierAssignment assignment = assignmentService.getAssignmentById(id);
        
        // Validate that the user has access to this assignment
        if (userType.equalsIgnoreCase("courier") && !assignment.getCourier().getCourierId().equals(userId)) {
            throw new CustomException("You can only view your own assignments", HttpStatus.FORBIDDEN);
        }
        if (userType.equalsIgnoreCase("restaurant") && !assignment.getOrder().getRestaurant().getRestaurantId().equals(userId)) {
            throw new CustomException("You can only view assignments for your restaurant", HttpStatus.FORBIDDEN);
        }

        return ResponseEntity.ok(assignment);
    }

    /**
     * Get the delivery history for the authenticated courier.
     * @param request HTTP request containing the authentication token
     * @return List of courier order history DTOs
     */
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
        if (header == null || !header.startsWith("Bearer ")) {
            throw new CustomException("Missing or invalid Authorization header", HttpStatus.UNAUTHORIZED);
        }
        return header.substring(7);
    }

    private void validateUserRole(String requiredRole) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        boolean hasRole = auth != null && auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_" + requiredRole));
        if (!hasRole) {
            throw new CustomException("Access denied. Required role: " + requiredRole, HttpStatus.FORBIDDEN);
        }
    }
} 