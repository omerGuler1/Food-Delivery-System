package com.hufds.repository;

import com.hufds.entity.CourierAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
     * Find all assignments for a courier with REQUESTED status, eagerly fetching order, restaurant, address, and customer.
     */
    @Query("SELECT ca FROM CourierAssignment ca " +
           "JOIN FETCH ca.order o " +
           "JOIN FETCH o.restaurant " +
           "JOIN FETCH o.address " +
           "JOIN FETCH o.customer " +
           "WHERE ca.courier.courierId = :courierId AND ca.status = :status")
    List<CourierAssignment> findWithOrderDetailsByCourierCourierIdAndStatus(
        @Param("courierId") Integer courierId,
        @Param("status") CourierAssignment.AssignmentStatus status
    );
} 