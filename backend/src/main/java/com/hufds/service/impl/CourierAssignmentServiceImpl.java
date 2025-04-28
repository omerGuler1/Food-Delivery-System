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

        if (courier.getStatus() != Courier.CourierStatus.Available) {
            throw new CustomException("Courier is not available", HttpStatus.BAD_REQUEST);
        }

        // Check if order is already assigned
        if (assignmentRepository.existsByOrderOrderId(assignmentDTO.getOrderId())) {
            throw new CustomException("Order is already assigned to a courier", HttpStatus.BAD_REQUEST);
        }

        // Create new assignment
        CourierAssignment assignment = new CourierAssignment();
        assignment.setOrder(order);
        assignment.setCourier(courier);
        assignment.setStatus(CourierAssignment.AssignmentStatus.ASSIGNED);

        // Update order status
        order.setStatus(Order.OrderStatus.OUT_FOR_DELIVERY);
        orderRepository.save(order);

        // Update courier status
        courier.setStatus(Courier.CourierStatus.Unavailable);
        courierRepository.save(courier);

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

        // Update timestamps based on status
        if (status == CourierAssignment.AssignmentStatus.PICKED_UP) {
            assignment.setPickedUpAt(java.time.LocalDateTime.now());
        } else if (status == CourierAssignment.AssignmentStatus.DELIVERED) {
            assignment.setDeliveredAt(java.time.LocalDateTime.now());
            // Update order status to DELIVERED
            Order order = assignment.getOrder();
            order.setStatus(Order.OrderStatus.DELIVERED);
            order.setDeliveredAt(java.time.LocalDateTime.now());
            orderRepository.save(order);
            // Make courier available again
            Courier courier = assignment.getCourier();
            courier.setStatus(Courier.CourierStatus.Available);
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
            case ASSIGNED:
                return next == CourierAssignment.AssignmentStatus.PICKED_UP || 
                       next == CourierAssignment.AssignmentStatus.CANCELLED;
            case PICKED_UP:
                return next == CourierAssignment.AssignmentStatus.DELIVERED || 
                       next == CourierAssignment.AssignmentStatus.CANCELLED;
            case DELIVERED:
                return false; // Cannot transition from DELIVERED
            case CANCELLED:
                return false; // Cannot transition from CANCELLED
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
                .<CourierOrderHistoryDTO>map(assignment -> {
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