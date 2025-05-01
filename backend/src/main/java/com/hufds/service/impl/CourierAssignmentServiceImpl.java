package com.hufds.service.impl;

import com.hufds.dto.CourierAssignmentDTO;
import com.hufds.dto.CourierOrderHistoryDTO;
import com.hufds.entity.CourierAssignment;
import com.hufds.entity.Order;
import com.hufds.entity.Courier;
import com.hufds.exception.CustomException;
import com.hufds.repository.CourierAssignmentRepository;
import com.hufds.repository.OrderRepository;
import com.hufds.repository.CourierRepository;
import com.hufds.service.CourierAssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourierAssignmentServiceImpl implements CourierAssignmentService {

    @Autowired
    private CourierAssignmentRepository assignmentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CourierRepository courierRepository;

    @Override
    @Transactional
    public CourierAssignment assignOrderToCourier(CourierAssignmentDTO assignmentDTO) {
        // Validate order exists and is in correct status
        Order order = orderRepository.findById(assignmentDTO.getOrderId())
                .orElseThrow(() -> new CustomException("Order not found", HttpStatus.NOT_FOUND));

        if (order.getStatus() != Order.OrderStatus.PROCESSING) {
            throw new CustomException("Order must be in PROCESSING status to assign courier", HttpStatus.BAD_REQUEST);
        }

        // Validate courier exists and is available
        Courier courier = courierRepository.findById(assignmentDTO.getCourierId())
                .orElseThrow(() -> new CustomException("Courier not found", HttpStatus.NOT_FOUND));

        if (courier.getStatus() != Courier.CourierStatus.AVAILABLE) {
            throw new CustomException("Courier is not available", HttpStatus.BAD_REQUEST);
        }

        // Check if order has any active assignments (not REJECTED or EXPIRED)
        List<CourierAssignment> existingAssignments = assignmentRepository.findByOrderOrderId(assignmentDTO.getOrderId());
        boolean hasActiveAssignment = existingAssignments.stream()
                .anyMatch(assignment -> 
                    assignment.getStatus() != CourierAssignment.AssignmentStatus.REJECTED && 
                    assignment.getStatus() != CourierAssignment.AssignmentStatus.EXPIRED);

        if (hasActiveAssignment) {
            throw new CustomException("Order is already assigned to a courier", HttpStatus.BAD_REQUEST);
        }

        // Create new assignment with REQUESTED status - store courier in database but don't associate with order yet
        CourierAssignment assignment = new CourierAssignment();
        assignment.setOrder(order);
        // We temporarily store the courier here but it's not truly assigned until acceptance
        assignment.setCourier(courier);
        assignment.setStatus(CourierAssignment.AssignmentStatus.REQUESTED);

        return assignmentRepository.save(assignment);
    }

    @Override
    @Transactional
    public CourierAssignment acceptDeliveryRequest(Integer assignmentId) {
        CourierAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new CustomException("Assignment not found", HttpStatus.NOT_FOUND));

        // Validate assignment status
        if (assignment.getStatus() != CourierAssignment.AssignmentStatus.REQUESTED) {
            throw new CustomException("Can only accept REQUESTED assignments", HttpStatus.BAD_REQUEST);
        }

        // Check if the request is too old (e.g., more than 5 minutes)
        if (assignment.getAssignedAt().plusMinutes(5).isBefore(java.time.LocalDateTime.now())) {
            // Mark the assignment as expired
            assignment.setStatus(CourierAssignment.AssignmentStatus.EXPIRED);
            assignmentRepository.save(assignment);
            throw new CustomException("This delivery request has expired", HttpStatus.BAD_REQUEST);
        }

        // Validate order status
        Order order = assignment.getOrder();
        if (order.getStatus() != Order.OrderStatus.PROCESSING) {
            throw new CustomException("Order is no longer available for delivery", HttpStatus.BAD_REQUEST);
        }

        // Get courier from assignment
        Courier courier = assignment.getCourier();
        
        // Validate courier is still available
        if (courier.getStatus() != Courier.CourierStatus.AVAILABLE) {
            throw new CustomException("Courier is no longer available", HttpStatus.BAD_REQUEST);
        }

        // Check if this order is already assigned to any courier with ACCEPTED status
        List<CourierAssignment> acceptedAssignments = assignmentRepository.findByOrderOrderIdAndStatus(
                order.getOrderId(), CourierAssignment.AssignmentStatus.ACCEPTED);
        
        if (!acceptedAssignments.isEmpty()) {
            throw new CustomException("Order is already assigned to another courier", HttpStatus.BAD_REQUEST);
        }

        // Update assignment status
        assignment.setStatus(CourierAssignment.AssignmentStatus.ACCEPTED);

        // Update order status
        order.setStatus(Order.OrderStatus.OUT_FOR_DELIVERY);
        order.setCourier(courier);
        orderRepository.save(order);

        // Update courier status
        courier.setStatus(Courier.CourierStatus.UNAVAILABLE);
        courierRepository.save(courier);

        return assignmentRepository.save(assignment);
    }

    @Override
    @Transactional
    public CourierAssignment rejectDeliveryRequest(Integer assignmentId) {
        CourierAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new CustomException("Assignment not found", HttpStatus.NOT_FOUND));

        if (assignment.getStatus() != CourierAssignment.AssignmentStatus.REQUESTED) {
            throw new CustomException("Can only reject REQUESTED assignments", HttpStatus.BAD_REQUEST);
        }

        // Update assignment status
        assignment.setStatus(CourierAssignment.AssignmentStatus.REJECTED);
        
        // Ensure the order status remains PROCESSING
        Order order = assignment.getOrder();
        if (order.getStatus() == Order.OrderStatus.PROCESSING) {
            // No need to change the status, just ensure it's saved
            orderRepository.save(order);
        }
        
        return assignmentRepository.save(assignment);
    }

    @Override
    @Transactional
    public CourierAssignment updateAssignmentStatus(Integer assignmentId, CourierAssignment.AssignmentStatus status) {
        CourierAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new CustomException("Assignment not found", HttpStatus.NOT_FOUND));

        // Validate status transition
        if (!isValidStatusTransition(assignment.getStatus(), status)) {
            throw new CustomException("Invalid status transition", HttpStatus.BAD_REQUEST);
        }

        assignment.setStatus(status);

        // Update timestamps and related entities based on status
        if (status == CourierAssignment.AssignmentStatus.PICKED_UP) {
            assignment.setPickedUpAt(java.time.LocalDateTime.now());
            // Set courier in the order
            Order order = assignment.getOrder();
            order.setCourier(assignment.getCourier());
            orderRepository.save(order);
        } else if (status == CourierAssignment.AssignmentStatus.DELIVERED) {
            assignment.setDeliveredAt(java.time.LocalDateTime.now());
            // Update order status to DELIVERED
            Order order = assignment.getOrder();
            order.setStatus(Order.OrderStatus.DELIVERED);
            order.setDeliveredAt(java.time.LocalDateTime.now());
            orderRepository.save(order);
            // Make courier available again
            Courier courier = assignment.getCourier();
            courier.setStatus(Courier.CourierStatus.AVAILABLE);
            courierRepository.save(courier);
        }

        return assignmentRepository.save(assignment);
    }

    @Override
    public CourierAssignment getAssignmentById(Integer assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new CustomException("Assignment not found", HttpStatus.NOT_FOUND));
    }

    private boolean isValidStatusTransition(CourierAssignment.AssignmentStatus current, CourierAssignment.AssignmentStatus next) {
        switch (current) {
            case REQUESTED:
                return next == CourierAssignment.AssignmentStatus.ACCEPTED || 
                       next == CourierAssignment.AssignmentStatus.REJECTED || 
                       next == CourierAssignment.AssignmentStatus.EXPIRED;
            case ACCEPTED:
                return next == CourierAssignment.AssignmentStatus.PICKED_UP || 
                       next == CourierAssignment.AssignmentStatus.CANCELLED;
            case PICKED_UP:
                return next == CourierAssignment.AssignmentStatus.DELIVERED || 
                       next == CourierAssignment.AssignmentStatus.CANCELLED;
            case DELIVERED:
            case REJECTED:
            case CANCELLED:
            case EXPIRED:
                return false; // Cannot transition from these states
            default:
                return false;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourierOrderHistoryDTO> getCourierOrderHistory(Integer courierId) {
        // Validate courier exists
        courierRepository.findById(courierId)
                .orElseThrow(() -> new CustomException("Courier not found", HttpStatus.NOT_FOUND));

        // Get all assignments for the courier
        List<CourierAssignment> assignments = assignmentRepository.findByCourierCourierId(courierId);

        // Convert assignments to DTOs
        return assignments.stream()
                .map(assignment -> {
                    Order order = assignment.getOrder();
                    return CourierOrderHistoryDTO.builder()
                            .orderId(order.getOrderId())
                            .assignmentId(assignment.getAssignmentId())
                            .restaurantName(order.getRestaurant().getName())
                            .customerName(order.getCustomer().getName())
                            .deliveryAddress(order.getAddress().getFullAddress())
                            .totalPrice(order.getTotalPrice())
                            .orderStatus(order.getStatus())
                            .assignmentStatus(assignment.getStatus())
                            .assignedAt(assignment.getAssignedAt())
                            .pickedUpAt(assignment.getPickedUpAt())
                            .deliveredAt(assignment.getDeliveredAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourierAssignment> getPendingRequestsForCourier(Integer courierId) {
        // Validate courier exists
        courierRepository.findById(courierId)
                .orElseThrow(() -> new CustomException("Courier not found", HttpStatus.NOT_FOUND));
        
        // Get all assignments with REQUESTED status for the courier
        return assignmentRepository.findByCourierCourierIdAndStatus(courierId, CourierAssignment.AssignmentStatus.REQUESTED);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourierAssignment> getAllAssignmentsForCourier(Integer courierId) {
        // Validate courier exists
        courierRepository.findById(courierId)
                .orElseThrow(() -> new CustomException("Courier not found", HttpStatus.NOT_FOUND));
        
        // Get all assignments for the courier regardless of status
        return assignmentRepository.findByCourierCourierId(courierId);
    }

    /**
     * Check if a delivery request has expired (older than 5 minutes).
     * 
     * @param assignmentId The assignment ID to check
     * @return true if the assignment is expired and was handled, false otherwise
     */
    @Override
    @Transactional
    public boolean checkAndHandleExpiredAssignment(Integer assignmentId) {
        CourierAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new CustomException("Assignment not found", HttpStatus.NOT_FOUND));
        
        // Only check REQUESTED assignments
        if (assignment.getStatus() != CourierAssignment.AssignmentStatus.REQUESTED) {
            return false;
        }
        
        // Check if the request is too old (more than 5 minutes)
        if (assignment.getAssignedAt().plusMinutes(5).isBefore(java.time.LocalDateTime.now())) {
            // Update assignment status to EXPIRED
            assignment.setStatus(CourierAssignment.AssignmentStatus.EXPIRED);
            assignmentRepository.save(assignment);
            return true;
        }
        
        return false;
    }

    /**
     * Check all requested assignments for a specific order and handle any expired ones.
     * 
     * @param orderId The order ID to check assignments for
     * @return true if any assignments were expired and handled, false otherwise
     */
    @Override
    @Transactional
    public boolean checkAndHandleExpiredAssignmentsForOrder(Integer orderId) {
        // Find all REQUESTED assignments for this order
        List<CourierAssignment> requestedAssignments = assignmentRepository.findByOrderOrderIdAndStatus(
                orderId, CourierAssignment.AssignmentStatus.REQUESTED);
        
        boolean anyExpired = false;
        
        for (CourierAssignment assignment : requestedAssignments) {
            // Check if the request is too old (more than 5 minutes)
            if (assignment.getAssignedAt().plusMinutes(5).isBefore(java.time.LocalDateTime.now())) {
                // Update assignment status to EXPIRED
                assignment.setStatus(CourierAssignment.AssignmentStatus.EXPIRED);
                assignmentRepository.save(assignment);
                anyExpired = true;
            }
        }
        
        return anyExpired;
    }

    /**
     * Find and return a list of orders that have all their courier assignments expired or rejected.
     * These orders can have new courier assignments created.
     * 
     * @param restaurantId The restaurant ID to check orders for
     * @return List of order IDs that need new courier assignments
     */
    @Override
    @Transactional(readOnly = true)
    public List<Integer> getOrdersNeedingNewCourierAssignment(Integer restaurantId) {
        // Find all PROCESSING orders for this restaurant
        List<Order> processingOrders = orderRepository.findByRestaurantRestaurantIdAndStatus(
                restaurantId, Order.OrderStatus.PROCESSING);
        
        return processingOrders.stream()
                .filter(order -> {
                    // Check all assignments for this order
                    List<CourierAssignment> assignments = assignmentRepository.findByOrderOrderId(order.getOrderId());
                    
                    // If no assignments exist, order needs a courier
                    if (assignments.isEmpty()) {
                        return true;
                    }
                    
                    // Order needs a new courier if all assignments are EXPIRED or REJECTED
                    return assignments.stream()
                            .allMatch(assignment -> 
                                assignment.getStatus() == CourierAssignment.AssignmentStatus.EXPIRED || 
                                assignment.getStatus() == CourierAssignment.AssignmentStatus.REJECTED);
                })
                .map(Order::getOrderId)
                .collect(Collectors.toList());
    }
} 