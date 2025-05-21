package com.hufds.service;

import com.hufds.dto.AdminEditCourierDTO;
import com.hufds.dto.AdminEditCustomerDTO;
import com.hufds.dto.AdminEditRestaurantDTO;
import com.hufds.entity.Courier;
import com.hufds.entity.Customer;
import com.hufds.entity.Restaurant;

import java.util.List;

/**
 * Service interface for admin operations
 */
public interface AdminService {

    /**
     * Delete a customer by ID
     * @param customerId ID of the customer to delete
     * @return true if deleted successfully, false otherwise
     */
    boolean deleteCustomer(Integer customerId);
    
    /**
     * Delete a restaurant by ID
     * @param restaurantId ID of the restaurant to delete
     * @return true if deleted successfully, false otherwise
     */
    boolean deleteRestaurant(Integer restaurantId);
    
    /**
     * Delete a courier by ID
     * @param courierId ID of the courier to delete
     * @return true if deleted successfully, false otherwise
     */
    boolean deleteCourier(Integer courierId);
    
    /**
     * Get all active (non-deleted) customers
     * @return List of active customers
     */
    List<Customer> getAllActiveCustomers();
    
    /**
     * Get all active (non-deleted) restaurants
     * @return List of active restaurants
     */
    List<Restaurant> getAllActiveRestaurants();
    
    /**
     * Get all active (non-deleted) couriers
     * @return List of active couriers
     */
    List<Courier> getAllActiveCouriers();
    
    /**
     * Edit a customer's information
     * @param dto DTO with updated information
     * @return Updated Customer entity
     */
    Customer editCustomer(AdminEditCustomerDTO dto);
    
    /**
     * Edit a restaurant's information
     * @param dto DTO with updated information
     * @return Updated Restaurant entity
     */
    Restaurant editRestaurant(AdminEditRestaurantDTO dto);
    
    /**
     * Edit a courier's information
     * @param dto DTO with updated information
     * @return Updated Courier entity
     */
    Courier editCourier(AdminEditCourierDTO dto);

    Restaurant updateRestaurantApprovalStatus(Integer restaurantId, Restaurant.ApprovalStatus status);
    
    Courier updateCourierApprovalStatus(Integer courierId, Courier.ApprovalStatus status);

    List<Restaurant> getPendingApprovalRestaurants();
    
    List<Courier> getPendingApprovalCouriers();
} 