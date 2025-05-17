package com.hufds.controller;

import com.hufds.dto.AdminEditCourierDTO;
import com.hufds.dto.AdminEditCustomerDTO;
import com.hufds.dto.AdminEditRestaurantDTO;
import com.hufds.entity.Courier;
import com.hufds.entity.Customer;
import com.hufds.entity.Restaurant;
import com.hufds.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

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
} 