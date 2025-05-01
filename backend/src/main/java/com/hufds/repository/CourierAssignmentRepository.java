package com.hufds.repository;

import com.hufds.entity.CourierAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourierAssignmentRepository extends JpaRepository<CourierAssignment, Integer> {
    boolean existsByOrderOrderId(Integer orderId);
    List<CourierAssignment> findByCourierCourierIdAndStatusIn(Integer courierId, List<CourierAssignment.AssignmentStatus> statuses);
    List<CourierAssignment> findByCourierCourierId(Integer courierId);
    boolean existsByOrderOrderIdAndStatusNot(Integer orderId, CourierAssignment.AssignmentStatus status);
    List<CourierAssignment> findByOrderOrderIdAndStatus(Integer orderId, CourierAssignment.AssignmentStatus status);
    
    /**
     * Find all assignments for a specific order regardless of status.
     * 
     * @param orderId The order ID
     * @return List of all assignments for the order
     */
    List<CourierAssignment> findByOrderOrderId(Integer orderId);
    
    /**
     * Find all assignments for a courier with REQUESTED status.
     * These are pending delivery requests that the courier can accept or reject.
     * 
     * @param courierId The courier ID
     * @return List of pending assignments
     */
    List<CourierAssignment> findByCourierCourierIdAndStatus(Integer courierId, CourierAssignment.AssignmentStatus status);
} 