package com.hufds.service;

import com.hufds.dto.OrderItemRequestDTO;
import com.hufds.dto.PlaceOrderRequestDTO;
import com.hufds.entity.*;
import com.hufds.exception.CustomException;
import com.hufds.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class OrderService {

    @Autowired private OrderRepository orderRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private RestaurantRepository restaurantRepository;
    @Autowired private AddressRepository addressRepository;
    @Autowired private MenuItemRepository menuItemRepository;

    @Transactional
    public Order placeOrder(PlaceOrderRequestDTO dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));

        Restaurant restaurant = restaurantRepository.findById(dto.getRestaurantId())
                .orElseThrow(() -> new EntityNotFoundException("Restaurant not found"));

        Address address = addressRepository.findById(dto.getAddressId())
                .orElseThrow(() -> new EntityNotFoundException("Address not found"));

        // Adres müşteriye ait mi kontrolü
        if (!address.getCustomer().getCustomerId().equals(customer.getCustomerId())) {
            throw new CustomException("This address does not belong to this customer", HttpStatus.FORBIDDEN);
        }

        Order order = new Order();
        order.setCustomer(customer);
        order.setRestaurant(restaurant);
        order.setAddress(address);

        Set<OrderItem> orderItems = new HashSet<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequestDTO itemDto : dto.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemDto.getMenuItemId())
                    .orElseThrow(() -> new EntityNotFoundException("Menu item not found"));

            // Menü öğesi belirtilen restorana ait mi kontrolü
            if (!menuItem.getRestaurant().getRestaurantId().equals(restaurant.getRestaurantId())) {
                throw new CustomException("Menu item does not belong to this restaurant", HttpStatus.BAD_REQUEST);
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemDto.getQuantity());
            BigDecimal subtotal = menuItem.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            orderItem.setSubtotal(subtotal);

            total = total.add(subtotal);
            orderItems.add(orderItem);
        }

        order.setOrderItems(orderItems);
        order.setTotalPrice(total);

        return orderRepository.save(order);
    }

    public Optional<Order> getOrderById(Integer id, Integer userId, String userType) {
        Optional<Order> orderOpt = orderRepository.findById(id);

        if (orderOpt.isEmpty()) {
            return Optional.empty();
        }

        Order order = orderOpt.get();

        // Yetki kontrolü - Kullanıcı türüne göre
        switch (userType.toLowerCase()) {
            case "customer" -> {
                // Müşteriler sadece kendi siparişlerini görebilir
                if (!order.getCustomer().getCustomerId().equals(userId)) {
                    return Optional.empty(); // Sipariş mevcut ama müşteriye ait değil
                }
            }
            case "restaurant" -> {
                // Restoranlar sadece kendilerine ait siparişleri görebilir
                if (!order.getRestaurant().getRestaurantId().equals(userId)) {
                    return Optional.empty();
                }
            }
            case "courier" -> {
                // Kuryeler sadece kendilerine atanmış siparişleri görebilir
                if (order.getCourier() == null || !order.getCourier().getCourierId().equals(userId)) {
                    return Optional.empty();
                }
            }
            default -> {
                // Bilinmeyen kullanıcı türü
                return Optional.empty();
            }
        }

        return Optional.of(order);
    }

    public Order updateOrderStatus(Integer id, Order.OrderStatus status, Integer userId, String userType) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        // Kullanıcı türü kontrolü - sadece restaurant ve courier roller için
        if (!userType.equalsIgnoreCase("restaurant") && !userType.equalsIgnoreCase("courier")) {
            throw new CustomException("Only restaurants and couriers can update order status", HttpStatus.FORBIDDEN);
        }

        // Kullanıcı türüne göre yetki ve status update kontrolü
        switch (userType.toLowerCase()) {
            case "restaurant" -> {
                // Restoran sadece kendi siparişlerini güncelleyebilir
                if (!order.getRestaurant().getRestaurantId().equals(userId)) {
                    throw new CustomException("You don't have permission to update this order", HttpStatus.FORBIDDEN);
                }

                // Restoranlar sadece PENDING -> PROCESSING veya PROCESSING -> OUT_FOR_DELIVERY yapabilir
                if (status == Order.OrderStatus.PROCESSING && order.getStatus() == Order.OrderStatus.PENDING) {
                    order.setStatus(status);
                } else if (status == Order.OrderStatus.OUT_FOR_DELIVERY && order.getStatus() == Order.OrderStatus.PROCESSING) {
                    order.setStatus(status);
                } else {
                    throw new CustomException("Invalid status transition for restaurant", HttpStatus.BAD_REQUEST);
                }
            }
            case "courier" -> {
                // Kurye sadece kendisine atanmış siparişleri güncelleyebilir
                if (order.getCourier() == null || !order.getCourier().getCourierId().equals(userId)) {
                    throw new CustomException("You don't have permission to update this order", HttpStatus.FORBIDDEN);
                }

                // Kuryeler sadece OUT_FOR_DELIVERY -> DELIVERED yapabilir
                if (status == Order.OrderStatus.DELIVERED && order.getStatus() == Order.OrderStatus.OUT_FOR_DELIVERY) {
                    order.setStatus(status);
                } else {
                    throw new CustomException("Invalid status transition for courier", HttpStatus.BAD_REQUEST);
                }
            }
            default ->
                    throw new CustomException("You don't have permission to update order status", HttpStatus.FORBIDDEN);
        }

        return orderRepository.save(order);
    }

    public Order cancelOrder(Integer id, Integer customerId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        // Sipariş müşteriye ait mi kontrolü
        if (!order.getCustomer().getCustomerId().equals(customerId)) {
            throw new CustomException("You don't have permission to cancel this order", HttpStatus.FORBIDDEN);
        }

        if (order.getStatus() == Order.OrderStatus.PENDING) {
            order.setStatus(Order.OrderStatus.CANCELLED);
            return orderRepository.save(order);
        } else {
            throw new CustomException("Only PENDING orders can be cancelled", HttpStatus.BAD_REQUEST);
        }
    }
}
