package com.hufds.repository;

import com.hufds.entity.CourierAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourierAssignmentRepository extends JpaRepository<CourierAssignment, Integer> {
    boolean existsByOrderOrderId(Integer orderId);
    List<CourierAssignment> findByCourierCourierIdAndStatusIn(Integer courierId, List<CourierAssignment.AssignmentStatus> statuses);
    List<CourierAssignment> findByCourierCourierId(Integer courierId);
} 