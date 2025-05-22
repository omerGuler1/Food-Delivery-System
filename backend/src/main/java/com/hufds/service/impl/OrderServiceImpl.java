package com.hufds.service.impl;

import com.hufds.dto.PlaceOrderRequestDTO;
import com.hufds.entity.*;
import com.hufds.repository.OrderRepository;
import com.hufds.repository.CustomerRepository;
import com.hufds.repository.RestaurantRepository;
import com.hufds.repository.AddressRepository;
import com.hufds.repository.MenuItemRepository;
import com.hufds.repository.CouponRepository;
import com.hufds.repository.PromotionRepository;
import com.hufds.service.OrderService;
import com.hufds.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);

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

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private PromotionRepository promotionRepository;

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

        // Create and save order first without items
        Order order = new Order();
        order.setCustomer(customer);
        order.setRestaurant(restaurant);
        order.setAddress(address);
        order.setTotalPrice(BigDecimal.ZERO);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order = orderRepository.save(order);

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
            orderItem.setOrder(order); // Set order reference explicitly
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemDto.getQuantity());
            orderItem.setSubtotal(menuItem.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity())));
            
            orderItems.add(orderItem);
            totalPrice = totalPrice.add(orderItem.getSubtotal());
        }

        // Apply promotion or coupon discount if applicable
        BigDecimal discountAmount = BigDecimal.ZERO;
        
        // Check and apply coupon if provided
        if (dto.getCouponId() != null) {
            Optional<Coupon> couponOpt = couponRepository.findById(dto.getCouponId());
            if (couponOpt.isPresent()) {
                Coupon coupon = couponOpt.get();
                
                // Validate coupon is active and not expired
                if (coupon.getIsActive() && 
                    (coupon.getEndDate() == null || coupon.getEndDate().isAfter(LocalDateTime.now().toLocalDate())) &&
                    (coupon.getQuota() > coupon.getUsageCount() || coupon.getQuota() == -1) &&
                    totalPrice.compareTo(coupon.getMinOrderAmount()) >= 0) {
                    
                    // Apply discount
                    discountAmount = coupon.getDiscountAmount();
                    
                    // Increment usage count
                    coupon.setUsageCount(coupon.getUsageCount() + 1);
                    couponRepository.save(coupon);
                    
                    log.info("Applied coupon {} to order {}. Discount: {}", 
                             coupon.getName(), order.getOrderId(), discountAmount);
                }
            }
        }
        // Check and apply promotion if provided and no coupon was applied
        else if (dto.getPromotionId() != null && discountAmount.compareTo(BigDecimal.ZERO) == 0) {
            Optional<Promotion> promotionOpt = promotionRepository.findById(dto.getPromotionId());
            if (promotionOpt.isPresent()) {
                Promotion promotion = promotionOpt.get();
                
                // Validate promotion is active and not expired
                if (promotion.getIsActive() && 
                    (promotion.getEndDate() == null || promotion.getEndDate().isAfter(LocalDateTime.now().toLocalDate()))) {
                    
                    // Calculate discount based on percentage
                    BigDecimal discountPercentage = BigDecimal.valueOf(promotion.getDiscountPercentage());
                    discountAmount = totalPrice.multiply(discountPercentage).divide(BigDecimal.valueOf(100));
                    
                    log.info("Applied promotion {} to order {}. Discount: {}", 
                             promotion.getName(), order.getOrderId(), discountAmount);
                }
            }
        }
        
        // Apply discount to total price if any
        if (discountAmount.compareTo(BigDecimal.ZERO) > 0) {
            totalPrice = totalPrice.subtract(discountAmount);
            // Ensure total price is not negative
            if (totalPrice.compareTo(BigDecimal.ZERO) < 0) {
                totalPrice = BigDecimal.ZERO;
            }
        }

        // Update order with items and total price
        order.setOrderItems(orderItems);
        order.setTotalPrice(totalPrice);

        // Save order with items
        order = orderRepository.save(order);

        // Create payment record for the order
        try {
            Payment payment = paymentService.createPayment(order.getOrderId(), dto.getPaymentMethod());
            
            // For credit card payments, process immediately
            if (dto.getPaymentMethod() == Payment.PaymentMethod.CREDIT_CARD) {
                payment = paymentService.processPayment(payment.getPaymentId());
            }
            
            order.setPayment(payment);
            order = orderRepository.save(order);
        } catch (Exception e) {
            // If payment creation or processing fails, we should roll back the entire transaction
            throw new RuntimeException("Failed to create/process payment record: " + e.getMessage());
        }

        return order;
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
        log.info("Attempting to update order status for order ID: {}. New status: {}", id, status);
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

        // Validate payment status for the new order status
        if (!paymentService.validatePaymentForOrderStatus(order, status)) {
            throw new RuntimeException("Payment validation failed for status change");
        }

        // If order is being delivered, process payment
        if (status == Order.OrderStatus.DELIVERED && order.getPayment() != null) {
            log.info("Order is delivered. Processing payment for payment ID: {}", order.getPayment().getPaymentId());
            if (order.getPayment().getMethod() == Payment.PaymentMethod.CASH_ON_DELIVERY ||
                order.getPayment().getMethod() == Payment.PaymentMethod.CREDIT_CARD) {
                paymentService.processPayment(order.getPayment().getPaymentId());
            }
        }

        order.setStatus(status);
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order cancelOrder(Integer id, Integer userId, String userType) {
        log.info("Attempting to cancel order ID: {} by user ID: {} of type: {}", id, userId, userType);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Validate user has permission to cancel
        if (userType.equals("CUSTOMER") && !order.getCustomer().getCustomerId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        if (userType.equals("RESTAURANT") && !order.getRestaurant().getRestaurantId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        // Validate order can be cancelled
        if (!canBeCancelled(order.getStatus())) {
            throw new RuntimeException("Order cannot be cancelled in its current status");
        }

        // If payment was completed, process refund
        if (order.getPayment() != null && 
            order.getPayment().getStatus() == Payment.PaymentStatus.COMPLETED) {
            log.info("Processing refund for payment ID: {}", order.getPayment().getPaymentId());
            paymentService.refundPayment(order.getPayment().getPaymentId());
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

    @Override
    public List<Order> getRestaurantOrders(Integer restaurantId, Order.OrderStatus status) {
        // Validate restaurant exists
        restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        
        return orderRepository.findByRestaurantRestaurantIdAndStatus(restaurantId, status);
    }

    @Override
    public List<Order> getAllRestaurantOrders(Integer restaurantId) {
        // Validate restaurant exists
        restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        
        return orderRepository.findByRestaurantRestaurantId(restaurantId);
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

    @Override
    public List<Order> getActiveCourierOrders(Integer courierId) {
        // Get orders with OUT_FOR_DELIVERY status assigned to this courier
        List<Order> orders = orderRepository.findByCourierCourierIdAndStatus(
            courierId, Order.OrderStatus.OUT_FOR_DELIVERY);
        
        // Make sure restaurant and customer are loaded (eager fetch)
        for (Order order : orders) {
            // Initialize restaurant and customer details to ensure they're loaded
            if (order.getRestaurant() != null) {
                order.getRestaurant().getName(); // Ensure data is fetched
            }
            if (order.getCustomer() != null) {
                order.getCustomer().getName(); // Ensure data is fetched
            }
        }
        
        return orders;
    }
} 