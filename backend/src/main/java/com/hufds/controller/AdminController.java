package com.hufds.controller;

import com.hufds.dto.AdminEditCourierDTO;
import com.hufds.dto.AdminEditCustomerDTO;
import com.hufds.dto.AdminEditRestaurantDTO;
import com.hufds.entity.AdminUser;
import com.hufds.entity.Courier;
import com.hufds.entity.Customer;
import com.hufds.entity.Restaurant;
import com.hufds.repository.AdminRepository;
import com.hufds.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final AdminRepository adminRepository;

    @GetMapping("/verify")
    public ResponseEntity<Void> verifyAdminExists() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        // Check if the admin with this email exists
        Optional<AdminUser> admin = adminRepository.findByEmail(email);
        if (admin.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        
        // If we get here, the admin exists
        return ResponseEntity.ok().build();
    }

    /**
     * Get all active customers
     */
    @GetMapping("/customers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Customer>> getAllCustomers() {
        List<Customer> customers = adminService.getAllActiveCustomers();
        return ResponseEntity.ok(customers);
    }

    /**
     * Get all active restaurants
     */
    @GetMapping("/restaurants")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
        List<Restaurant> restaurants = adminService.getAllActiveRestaurants();
        return ResponseEntity.ok(restaurants);
    }

    /**
     * Get all active couriers
     */
    @GetMapping("/couriers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Courier>> getAllCouriers() {
        List<Courier> couriers = adminService.getAllActiveCouriers();
        return ResponseEntity.ok(couriers);
    }

    /**
     * Edit a customer's information
     */
    @PutMapping("/customers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Customer> editCustomer(@Valid @RequestBody AdminEditCustomerDTO dto) {
        Customer customer = adminService.editCustomer(dto);
        return ResponseEntity.ok(customer);
    }

    /**
     * Edit a restaurant's information
     */
    @PutMapping("/restaurants")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Restaurant> editRestaurant(@Valid @RequestBody AdminEditRestaurantDTO dto) {
        Restaurant restaurant = adminService.editRestaurant(dto);
        return ResponseEntity.ok(restaurant);
    }

    /**
     * Edit a courier's information
     */
    @PutMapping("/couriers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Courier> editCourier(@Valid @RequestBody AdminEditCourierDTO dto) {
        Courier courier = adminService.editCourier(dto);
        return ResponseEntity.ok(courier);
    }

    /**
     * Delete a customer by ID (soft delete)
     */
    @DeleteMapping("/customers/{customerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Integer customerId) {
        boolean deleted = adminService.deleteCustomer(customerId);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Delete a restaurant by ID (soft delete)
     */
    @DeleteMapping("/restaurants/{restaurantId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRestaurant(@PathVariable Integer restaurantId) {
        boolean deleted = adminService.deleteRestaurant(restaurantId);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Delete a courier by ID (soft delete)
     */
    @DeleteMapping("/couriers/{courierId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCourier(@PathVariable Integer courierId) {
        boolean deleted = adminService.deleteCourier(courierId);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/restaurants/{restaurantId}/approval-status")
    public ResponseEntity<?> updateRestaurantApprovalStatus(
            @PathVariable Integer restaurantId,
            @RequestParam Restaurant.ApprovalStatus status) {
        Restaurant restaurant = adminService.updateRestaurantApprovalStatus(restaurantId, status);
        return ResponseEntity.ok(Map.of(
            "restaurantId", restaurant.getRestaurantId(),
            "approvalStatus", restaurant.getApprovalStatus(),
            "message", "Restaurant approval status updated successfully"
        ));
    }

    @PutMapping("/couriers/{courierId}/approval-status")
    public ResponseEntity<?> updateCourierApprovalStatus(
            @PathVariable Integer courierId,
            @RequestParam Courier.ApprovalStatus status) {
        Courier courier = adminService.updateCourierApprovalStatus(courierId, status);
        return ResponseEntity.ok(Map.of(
            "courierId", courier.getCourierId(),
            "approvalStatus", courier.getApprovalStatus(),
            "message", "Courier approval status updated successfully"
        ));
    }

    @GetMapping("/restaurants/pending-approval")
    public ResponseEntity<List<Restaurant>> getPendingRestaurants() {
        return ResponseEntity.ok(adminService.getPendingApprovalRestaurants());
    }

    @GetMapping("/couriers/pending-approval")
    public ResponseEntity<List<Courier>> getPendingCouriers() {
        return ResponseEntity.ok(adminService.getPendingApprovalCouriers());
    }

    /**
     * Search users by type and query
     * @param type Type of user to search for (CUSTOMER, RESTAURANT, COURIER)
     * @param query Search query for name or email
     * @return List of matching users
     */
    @GetMapping("/users/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<com.hufds.dto.UserSearchResultDTO>> searchUsers(
            @RequestParam String type,
            @RequestParam String query) {
        List<com.hufds.dto.UserSearchResultDTO> results = adminService.searchUsers(type, query);
        return ResponseEntity.ok(results);
    }
    
    /**
     * Ban a customer until the specified date
     * @param customerId Customer ID to ban
     * @param days Number of days to ban the customer (can be decimal for hours/seconds)
     * @return Updated customer
     */
    @PostMapping("/customers/{customerId}/ban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Customer> banCustomer(
            @PathVariable Integer customerId,
            @RequestParam Double days) {
        // Calculate ban duration - supporting fractional days for seconds/minutes/hours
        LocalDateTime banUntil = LocalDateTime.now().plusSeconds((long)(days * 24 * 60 * 60));
        Customer customer = adminService.banCustomer(customerId, banUntil);
        return ResponseEntity.ok(customer);
    }
    
    /**
     * Ban a restaurant until the specified date
     * @param restaurantId Restaurant ID to ban
     * @param days Number of days to ban the restaurant (can be decimal for hours/seconds)
     * @return Updated restaurant
     */
    @PostMapping("/restaurants/{restaurantId}/ban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Restaurant> banRestaurant(
            @PathVariable Integer restaurantId,
            @RequestParam Double days) {
        // Calculate ban duration - supporting fractional days for seconds/minutes/hours
        LocalDateTime banUntil = LocalDateTime.now().plusSeconds((long)(days * 24 * 60 * 60));
        Restaurant restaurant = adminService.banRestaurant(restaurantId, banUntil);
        return ResponseEntity.ok(restaurant);
    }
    
    /**
     * Ban a courier until the specified date
     * @param courierId Courier ID to ban
     * @param days Number of days to ban the courier (can be decimal for hours/seconds)
     * @return Updated courier
     */
    @PostMapping("/couriers/{courierId}/ban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Courier> banCourier(
            @PathVariable Integer courierId,
            @RequestParam Double days) {
        // Calculate ban duration - supporting fractional days for seconds/minutes/hours
        LocalDateTime banUntil = LocalDateTime.now().plusSeconds((long)(days * 24 * 60 * 60));
        Courier courier = adminService.banCourier(courierId, banUntil);
        return ResponseEntity.ok(courier);
    }
    
    /**
     * Remove ban from a customer
     * @param customerId Customer ID to unban
     * @return Updated customer
     */
    @PostMapping("/customers/{customerId}/unban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Customer> unbanCustomer(@PathVariable Integer customerId) {
        Customer customer = adminService.unbanCustomer(customerId);
        return ResponseEntity.ok(customer);
    }
    
    /**
     * Remove ban from a restaurant
     * @param restaurantId Restaurant ID to unban
     * @return Updated restaurant
     */
    @PostMapping("/restaurants/{restaurantId}/unban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Restaurant> unbanRestaurant(@PathVariable Integer restaurantId) {
        Restaurant restaurant = adminService.unbanRestaurant(restaurantId);
        return ResponseEntity.ok(restaurant);
    }
    
    /**
     * Remove ban from a courier
     * @param courierId Courier ID to unban
     * @return Updated courier
     */
    @PostMapping("/couriers/{courierId}/unban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Courier> unbanCourier(@PathVariable Integer courierId) {
        Courier courier = adminService.unbanCourier(courierId);
        return ResponseEntity.ok(courier);
    }
} 