package com.hufds.service.impl;

import com.hufds.dto.CourierAssignmentDTO;
import com.hufds.dto.CourierOrderHistoryDTO;
import com.hufds.dto.CourierAssignmentRequestDTO;
import com.hufds.entity.CourierAssignment;
import com.hufds.entity.Order;
import com.hufds.entity.Courier;
import com.hufds.exception.CustomException;
import com.hufds.repository.CourierAssignmentRepository;
import com.hufds.repository.OrderRepository;
import com.hufds.repository.CourierRepository;
import com.hufds.service.CourierAssignmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@Service
public class CourierAssignmentServiceImpl implements CourierAssignmentService {

    private static final Logger log = LoggerFactory.getLogger(CourierAssignmentServiceImpl.class);

    @Autowired
    private CourierAssignmentRepository assignmentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CourierRepository courierRepository;

    @Override
    @Transactional
    public CourierAssignment assignOrderToCourier(CourierAssignmentRequestDTO assignmentDTO) {
        // Validate order exists and is in correct status
        Order order = orderRepository.findById(assignmentDTO.getOrderId())
                .orElseThrow(() -> new CustomException("Order not found", HttpStatus.NOT_FOUND));

        // Validate order has complete data
        if (order.getRestaurant() == null) {
            throw new CustomException("Order is missing restaurant information", HttpStatus.BAD_REQUEST);
        }
        if (order.getAddress() == null) {
            throw new CustomException("Order is missing delivery address", HttpStatus.BAD_REQUEST);
        }
        if (order.getCustomer() == null) {
            throw new CustomException("Order is missing customer information", HttpStatus.BAD_REQUEST);
        }

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
        log.info("[DEBUG] Attempting to accept delivery request for assignment: {}", assignmentId);
        
        CourierAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> {
                    log.error("[DEBUG] Assignment not found: {}", assignmentId);
                    return new CustomException("Assignment not found", HttpStatus.NOT_FOUND);
                });

        // Validate assignment status
        log.info("[DEBUG] Current assignment status: {}", assignment.getStatus());
        if (assignment.getStatus() != CourierAssignment.AssignmentStatus.REQUESTED) {
            log.error("[DEBUG] Invalid assignment status. Expected: REQUESTED, Got: {}", assignment.getStatus());
            throw new CustomException("Can only accept REQUESTED assignments", HttpStatus.BAD_REQUEST);
        }

        // Check if the request is too old
        LocalDateTime expiryTime = assignment.getAssignedAt().plusMinutes(5);
        log.info("[DEBUG] Assignment assigned at: {}, Expires at: {}, Current time: {}", 
            assignment.getAssignedAt(), expiryTime, LocalDateTime.now());
        if (expiryTime.isBefore(LocalDateTime.now())) {
            log.error("[DEBUG] Assignment expired. Assignment time: {}, Current time: {}", 
                assignment.getAssignedAt(), LocalDateTime.now());
            assignment.setStatus(CourierAssignment.AssignmentStatus.EXPIRED);
            assignmentRepository.save(assignment);
            throw new CustomException("This delivery request has expired", HttpStatus.BAD_REQUEST);
        }

        // Validate order status
        Order order = assignment.getOrder();
        log.info("[DEBUG] Order status: {}", order.getStatus());
        if (order.getStatus() != Order.OrderStatus.PROCESSING) {
            log.error("[DEBUG] Invalid order status. Expected: PROCESSING, Got: {}", order.getStatus());
            throw new CustomException("Order is no longer available for delivery", HttpStatus.BAD_REQUEST);
        }

        // Get courier from assignment
        Courier courier = assignment.getCourier();
        log.info("[DEBUG] Courier status: {}", courier.getStatus());
        
        // Validate courier is still available
        if (courier.getStatus() != Courier.CourierStatus.AVAILABLE) {
            log.error("[DEBUG] Courier not available. Status: {}", courier.getStatus());
            throw new CustomException("Courier is no longer available", HttpStatus.BAD_REQUEST);
        }

        // Check if this order is already assigned
        List<CourierAssignment> acceptedAssignments = assignmentRepository.findByOrderOrderIdAndStatus(
                order.getOrderId(), CourierAssignment.AssignmentStatus.ACCEPTED);
        log.info("[DEBUG] Found {} existing accepted assignments for order {}", 
            acceptedAssignments.size(), order.getOrderId());
        
        if (!acceptedAssignments.isEmpty()) {
            log.error("[DEBUG] Order already assigned to another courier");
            throw new CustomException("Order is already assigned to another courier", HttpStatus.BAD_REQUEST);
        }

        log.info("[DEBUG] All validations passed, proceeding with acceptance");

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

        log.debug("[DEBUG] Found {} assignments for courier {}", assignments.size(), courierId);

        // Convert assignments to DTOs, skip if order is missing
        return assignments.stream()
                .map(assignment -> {
                    Order order = assignment.getOrder();
                    if (order == null) {
                        log.error("[DEBUG] Assignment {} has null order, skipping", assignment.getAssignmentId());
                        return null;
                    }
                    log.debug("[DEBUG] Assignment {}: orderId={}", assignment.getAssignmentId(), order.getOrderId());
                    try {
                    return CourierOrderHistoryDTO.builder()
                            .orderId(order.getOrderId())
                            .assignmentId(assignment.getAssignmentId())
                                .restaurantName(order.getRestaurant() != null ? order.getRestaurant().getName() : "Unknown")
                                .customerName(order.getCustomer() != null ? order.getCustomer().getName() : "Unknown")
                                .deliveryAddress(order.getAddress() != null ? order.getAddress().getFullAddress() : "Unknown")
                            .totalPrice(order.getTotalPrice())
                            .orderStatus(order.getStatus())
                            .assignmentStatus(assignment.getStatus())
                            .assignedAt(assignment.getAssignedAt())
                            .pickedUpAt(assignment.getPickedUpAt())
                            .deliveredAt(assignment.getDeliveredAt())
                            .build();
                    } catch (Exception e) {
                        log.error("[DEBUG] Error building CourierOrderHistoryDTO for assignment {}: {}", assignment.getAssignmentId(), e.getMessage());
                        return null;
                    }
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourierAssignmentDTO> getPendingRequestsForCourier(Integer courierId) {
        // Validate courier exists
        courierRepository.findById(courierId)
                .orElseThrow(() -> new CustomException("Courier not found", HttpStatus.NOT_FOUND));
        
        // Use the new eager fetch method
        List<CourierAssignment> pending = assignmentRepository.findWithOrderDetailsByCourierCourierIdAndStatus(
            courierId,
            CourierAssignment.AssignmentStatus.REQUESTED
        );

        log.info("[DEBUG] Found {} pending assignments for courier {} (eager fetch)", pending.size(), courierId);

        // Convert to DTOs and log any issues
        List<CourierAssignmentDTO> dtos = pending.stream()
            .map(assignment -> {
                try {
                    CourierAssignmentDTO dto = toDTO(assignment);
                    if (dto == null) {
                        log.error("[DEBUG] Failed to convert assignment {} to DTO", assignment.getAssignmentId());
                    }
                    return dto;
                } catch (Exception e) {
                    log.error("[DEBUG] Error converting assignment {} to DTO: {}", 
                        assignment.getAssignmentId(), e.getMessage());
                    return null;
                }
            })
            .filter(java.util.Objects::nonNull)
            .collect(Collectors.toList());

        log.info("[DEBUG] Successfully converted {} assignments to DTOs", dtos.size());
        return dtos;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourierAssignmentDTO> getAllAssignmentsForCourier(Integer courierId) {
        courierRepository.findById(courierId)
                .orElseThrow(() -> new CustomException("Courier not found", HttpStatus.NOT_FOUND));
        List<CourierAssignment> all = assignmentRepository.findByCourierCourierId(courierId);
        System.out.println("[DEBUG] All assignments for courier " + courierId + ": " + all.size());
        for (CourierAssignment a : all) {
            System.out.println("[DEBUG] AssignmentId: " + a.getAssignmentId() + ", status: " + a.getStatus() + ", orderId: " + (a.getOrder() != null ? a.getOrder().getOrderId() : null));
        }
        return all.stream().map(this::toDTO).filter(java.util.Objects::nonNull).collect(Collectors.toList());
    }

    private CourierAssignmentDTO toDTO(CourierAssignment assignment) {
        Order order = assignment.getOrder();
        if (order == null) {
            log.error("[DEBUG] Assignment {} has null order", assignment.getAssignmentId());
            return null;
        }
        log.debug("[DEBUG] Assignment {}: orderId={}, customerId={}, restaurantId={}, addressId={}",
            assignment.getAssignmentId(),
            order.getOrderId(),
            order.getCustomer() != null ? order.getCustomer().getCustomerId() : null,
            order.getRestaurant() != null ? order.getRestaurant().getRestaurantId() : null,
            order.getAddress() != null ? order.getAddress().getAddressId() : null
        );
        if (order.getCustomer() == null) {
            log.error("[DEBUG] Assignment {} has order {} with null customer", assignment.getAssignmentId(), order.getOrderId());
            return null;
        } else {
            log.debug("[DEBUG] Assignment {}: Customer name={}, email={}", assignment.getAssignmentId(), order.getCustomer().getName(), order.getCustomer().getEmail());
        }
        if (order.getRestaurant() == null) {
            log.error("[DEBUG] Assignment {} has order {} with null restaurant", assignment.getAssignmentId(), order.getOrderId());
            return null;
        } else {
            log.debug("[DEBUG] Assignment {}: Restaurant name={}, email={}", assignment.getAssignmentId(), order.getRestaurant().getName(), order.getRestaurant().getEmail());
        }
        if (order.getAddress() == null) {
            log.error("[DEBUG] Assignment {} has order {} with null address", assignment.getAssignmentId(), order.getOrderId());
            return null;
        } else {
            log.debug("[DEBUG] Assignment {}: Address street={}, city={}, state={}, zip={}, country={}",
                assignment.getAssignmentId(),
                order.getAddress().getStreet(),
                order.getAddress().getCity(),
                order.getAddress().getState(),
                order.getAddress().getZipCode(),
                order.getAddress().getCountry()
            );
        }
        log.info("[DEBUG] Converting assignment {} to DTO - Order: {}, Restaurant: {}, Address: {}, Customer: {}", 
            assignment.getAssignmentId(),
            order.getOrderId(),
            order.getRestaurant().getRestaurantId(),
            order.getAddress().getAddressId(),
            order.getCustomer().getCustomerId());
        return CourierAssignmentDTO.builder()
                .assignmentId(assignment.getAssignmentId())
                .status(assignment.getStatus().name())
                .assignedAt(assignment.getAssignedAt())
                .pickedUpAt(assignment.getPickedUpAt())
                .deliveredAt(assignment.getDeliveredAt())
                .order(CourierAssignmentDTO.OrderSummaryDTO.builder()
                        .orderId(order.getOrderId())
                        .status(order.getStatus().name())
                        .restaurant(CourierAssignmentDTO.RestaurantSummaryDTO.builder()
                                .restaurantId(order.getRestaurant().getRestaurantId())
                                .name(order.getRestaurant().getName())
                                .phoneNumber(order.getRestaurant().getPhoneNumber())
                                .cuisineType(order.getRestaurant().getCuisineType())
                                .build())
                        .address(CourierAssignmentDTO.AddressSummaryDTO.builder()
                                .street(order.getAddress().getStreet())
                                .city(order.getAddress().getCity())
                                .state(order.getAddress().getState())
                                .zipCode(order.getAddress().getZipCode())
                                .country(order.getAddress().getCountry())
                                .build())
                        .customer(CourierAssignmentDTO.CustomerSummaryDTO.builder()
                                .customerId(order.getCustomer().getCustomerId())
                                .name(order.getCustomer().getName())
                                .phoneNumber(order.getCustomer().getPhoneNumber())
                                .build())
                        .totalPrice(order.getTotalPrice() != null ? order.getTotalPrice().doubleValue() : 0.0)
                        .createdAt(order.getCreatedAt())
                        .deliveredAt(order.getDeliveredAt())
                        .build())
                .build();
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