package com.hufds.service;

import com.hufds.dto.CourierAssignmentDTO;
import com.hufds.dto.CourierOrderHistoryDTO;
import com.hufds.entity.CourierAssignment;

import java.util.List;

public interface CourierAssignmentService {
    CourierAssignment assignOrderToCourier(CourierAssignmentDTO assignmentDTO);
    CourierAssignment acceptDeliveryRequest(Integer assignmentId);
    CourierAssignment rejectDeliveryRequest(Integer assignmentId);
    CourierAssignment updateAssignmentStatus(Integer assignmentId, CourierAssignment.AssignmentStatus status);
    CourierAssignment getAssignmentById(Integer assignmentId);
    List<CourierOrderHistoryDTO> getCourierOrderHistory(Integer courierId);
    
    /**
     * Get all pending delivery requests for a courier.
     * These are assignments with REQUESTED status.
     * 
     * @param courierId The courier ID
     * @return List of pending courier assignments
     */
    List<CourierAssignment> getPendingRequestsForCourier(Integer courierId);
    
    /**
     * Get all assignments for a courier regardless of status.
     * 
     * @param courierId The courier ID
     * @return List of all courier assignments
     */
    List<CourierAssignment> getAllAssignmentsForCourier(Integer courierId);
    
    /**
     * Check if a delivery request has expired (older than 5 minutes).
     * 
     * @param assignmentId The assignment ID to check
     * @return true if the assignment is expired and was handled, false otherwise
     */
    boolean checkAndHandleExpiredAssignment(Integer assignmentId);
    
    /**
     * Check all requested assignments for a specific order and handle any expired ones.
     * 
     * @param orderId The order ID to check assignments for
     * @return true if any assignments were expired and handled, false otherwise
     */
    boolean checkAndHandleExpiredAssignmentsForOrder(Integer orderId);
    
    /**
     * Find and return a list of orders that have all their courier assignments expired or rejected.
     * These orders can have new courier assignments created.
     * 
     * @param restaurantId The restaurant ID to check orders for
     * @return List of order IDs that need new courier assignments
     */
    List<Integer> getOrdersNeedingNewCourierAssignment(Integer restaurantId);
} 