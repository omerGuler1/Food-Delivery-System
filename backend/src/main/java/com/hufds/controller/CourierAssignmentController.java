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

    /**
     * Get all pending delivery requests for the authenticated courier.
     * These are assignments with status REQUESTED that the courier can accept or reject.
     * 
     * @param request HTTP request containing the authentication token
     * @return List of pending courier assignments
     */
    @GetMapping("/pending-requests")
    public ResponseEntity<List<CourierAssignment>> getPendingDeliveryRequests(HttpServletRequest request) {
        validateUserRole("courier");
        String token = extractToken(request);
        Integer courierId = jwtService.extractUserId(token);
        
        log.info("Fetching pending delivery requests for courier: {}", courierId);
        List<CourierAssignment> pendingRequests = assignmentService.getPendingRequestsForCourier(courierId);
        log.info("Found {} pending requests for courier {}", pendingRequests.size(), courierId);
        
        return ResponseEntity.ok(pendingRequests);
    }

    /**
     * Get all delivery requests for a specific courier ID.
     * Primarily for administrative purposes - requires proper authentication.
     * 
     * @param courierId The courier ID to get requests for
     * @param request HTTP request containing the authentication token
     * @return List of courier assignments for the courier
     */
    @GetMapping("/courier/{courierId}")
    public ResponseEntity<List<CourierAssignment>> getAssignmentsForCourier(
            @PathVariable Integer courierId,
            HttpServletRequest request) {
        
        validateUserRole("courier");
        String token = extractToken(request);
        Integer authenticatedCourierId = jwtService.extractUserId(token);
        
        // Ensure courier can only see their own assignments
        if (!authenticatedCourierId.equals(courierId)) {
            throw new CustomException("You can only view your own assignments", HttpStatus.FORBIDDEN);
        }
        
        log.info("Fetching all assignments for courier: {}", courierId);
        List<CourierAssignment> assignments = assignmentService.getAllAssignmentsForCourier(courierId);
        log.info("Found {} assignments for courier {}", assignments.size(), courierId);
        
        return ResponseEntity.ok(assignments);
    }

    /**
     * Check if a specific assignment has expired.
     * 
     * @param id The assignment ID to check
     * @return True if the assignment was expired and handled, false otherwise
     */
    @GetMapping("/{id}/check-expired")
    public ResponseEntity<Boolean> checkAssignmentExpired(@PathVariable Integer id) {
        try {
            log.info("Checking if assignment {} has expired", id);
            boolean expired = assignmentService.checkAndHandleExpiredAssignment(id);
            log.info("Assignment {} expired status: {}", id, expired);
            return ResponseEntity.ok(expired);
        } catch (Exception e) {
            log.error("Error checking if assignment is expired: {}", e.getMessage(), e);
            throw new CustomException("Error checking if assignment is expired", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Check all requested assignments for a specific order and handle expired ones.
     * 
     * @param orderId The order ID to check
     * @return True if any assignments were expired and handled, false otherwise
     */
    @GetMapping("/order/{orderId}/check-expired")
    public ResponseEntity<Boolean> checkOrderAssignmentsExpired(@PathVariable Integer orderId) {
        try {
            log.info("Checking if any assignments for order {} have expired", orderId);
            boolean anyExpired = assignmentService.checkAndHandleExpiredAssignmentsForOrder(orderId);
            log.info("Order {} has expired assignments: {}", orderId, anyExpired);
            return ResponseEntity.ok(anyExpired);
        } catch (Exception e) {
            log.error("Error checking for expired assignments: {}", e.getMessage(), e);
            throw new CustomException("Error checking for expired assignments", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get a list of order IDs for a restaurant that need new courier assignments.
     * These are orders with all courier assignments either expired or rejected.
     * 
     * @param restaurantId The restaurant ID
     * @param request HTTP request containing the authentication token
     * @return List of order IDs that need new courier assignments
     */
    @GetMapping("/restaurant/{restaurantId}/orders-needing-couriers")
    public ResponseEntity<List<Integer>> getOrdersNeedingCouriers(
            @PathVariable Integer restaurantId,
            HttpServletRequest request) {
        
        validateUserRole("restaurant");
        String token = extractToken(request);
        Integer authenticatedRestaurantId = jwtService.extractUserId(token);
        
        // Ensure restaurant can only see its own orders
        if (!authenticatedRestaurantId.equals(restaurantId)) {
            throw new CustomException("You can only view your own orders", HttpStatus.FORBIDDEN);
        }
        
        try {
            log.info("Finding orders for restaurant {} that need new courier assignments", restaurantId);
            List<Integer> orderIds = assignmentService.getOrdersNeedingNewCourierAssignment(restaurantId);
            log.info("Found {} orders needing courier assignments for restaurant {}", orderIds.size(), restaurantId);
            return ResponseEntity.ok(orderIds);
        } catch (Exception e) {
            log.error("Error finding orders needing couriers: {}", e.getMessage(), e);
            throw new CustomException("Error finding orders needing couriers", HttpStatus.INTERNAL_SERVER_ERROR);
        }
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