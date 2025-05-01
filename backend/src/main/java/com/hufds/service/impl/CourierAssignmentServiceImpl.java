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

        // Check if order is already assigned
        if (assignmentRepository.existsByOrderOrderId(assignmentDTO.getOrderId())) {
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

        // Check if this order is already assigned to another courier with ACCEPTED status
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

        assignment.setStatus(CourierAssignment.AssignmentStatus.REJECTED);
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
                       next == CourierAssignment.AssignmentStatus.REJECTED;
            case ACCEPTED:
                return next == CourierAssignment.AssignmentStatus.ASSIGNED || 
                       next == CourierAssignment.AssignmentStatus.CANCELLED;
            case ASSIGNED:
                return next == CourierAssignment.AssignmentStatus.PICKED_UP || 
                       next == CourierAssignment.AssignmentStatus.CANCELLED;
            case PICKED_UP:
                return next == CourierAssignment.AssignmentStatus.DELIVERED || 
                       next == CourierAssignment.AssignmentStatus.CANCELLED;
            case DELIVERED:
            case REJECTED:
            case CANCELLED:
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
} 