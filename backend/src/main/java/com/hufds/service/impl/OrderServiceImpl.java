package com.hufds.service.impl;

import com.hufds.dto.PlaceOrderRequestDTO;
import com.hufds.entity.*;
import com.hufds.repository.OrderRepository;
import com.hufds.repository.CustomerRepository;
import com.hufds.repository.RestaurantRepository;
import com.hufds.repository.AddressRepository;
import com.hufds.repository.MenuItemRepository;
import com.hufds.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Override
    @Transactional
    public Order placeOrder(PlaceOrderRequestDTO dto) {
        // Validate customer exists
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Validate restaurant exists
        Restaurant restaurant = restaurantRepository.findById(dto.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        // Validate address exists and belongs to customer
        Address address = addressRepository.findById(dto.getAddressId())
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getCustomer().getCustomerId().equals(customer.getCustomerId())) {
            throw new RuntimeException("Address does not belong to customer");
        }

        // Create order items and calculate total
        Set<OrderItem> orderItems = new HashSet<>();
        BigDecimal totalPrice = BigDecimal.ZERO;

        for (var itemDto : dto.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemDto.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found"));

            // Validate menu item belongs to restaurant
            if (!menuItem.getRestaurant().getRestaurantId().equals(restaurant.getRestaurantId())) {
                throw new RuntimeException("Menu item does not belong to restaurant");
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemDto.getQuantity());
            orderItem.setSubtotal(menuItem.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity())));
            
            orderItems.add(orderItem);
            totalPrice = totalPrice.add(orderItem.getSubtotal());
        }

        // Create and save order
        Order order = new Order();
        order.setCustomer(customer);
        order.setRestaurant(restaurant);
        order.setAddress(address);
        order.setOrderItems(orderItems);
        order.setTotalPrice(totalPrice);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    @Override
    public Optional<Order> getOrderById(Integer id, Integer userId, String userType) {
        Optional<Order> order = orderRepository.findById(id);
        
        if (order.isPresent()) {
            Order foundOrder = order.get();
            
            // Check access permissions
            if (userType.equals("CUSTOMER") && !foundOrder.getCustomer().getCustomerId().equals(userId)) {
                throw new RuntimeException("Access denied");
            }
            
            if (userType.equals("RESTAURANT") && !foundOrder.getRestaurant().getRestaurantId().equals(userId)) {
                throw new RuntimeException("Access denied");
            }
        }
        
        return order;
    }

    @Override
    @Transactional
    public Order updateOrderStatus(Integer id, Order.OrderStatus status, Integer userId, String userType) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Validate user has permission to update status
        if (userType.equals("RESTAURANT") && !order.getRestaurant().getRestaurantId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        // Validate status transition
        if (!isValidStatusTransition(order.getStatus(), status)) {
            throw new RuntimeException("Invalid status transition");
        }

        order.setStatus(status);
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order cancelOrder(Integer id, Integer customerId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Validate customer owns the order
        if (!order.getCustomer().getCustomerId().equals(customerId)) {
            throw new RuntimeException("Access denied");
        }

        // Validate order can be cancelled
        if (!canBeCancelled(order.getStatus())) {
            throw new RuntimeException("Order cannot be cancelled in its current status");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

    private boolean isValidStatusTransition(Order.OrderStatus current, Order.OrderStatus next) {
        // Define valid status transitions
        switch (current) {
            case PENDING:
                return next == Order.OrderStatus.PROCESSING || next == Order.OrderStatus.CANCELLED;
            case PROCESSING:
                return next == Order.OrderStatus.OUT_FOR_DELIVERY;
            case OUT_FOR_DELIVERY:
                return next == Order.OrderStatus.DELIVERED;
            default:
                return false;
        }
    }

    private boolean canBeCancelled(Order.OrderStatus status) {
        return status == Order.OrderStatus.PENDING;
    }
} 