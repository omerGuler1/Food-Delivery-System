package com.hufds.service.impl;

import com.hufds.entity.Courier;
import com.hufds.entity.Order;
import com.hufds.repository.CourierRepository;
import com.hufds.repository.OrderRepository;
import com.hufds.service.CourierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourierServiceImpl implements CourierService {

    @Autowired
    private CourierRepository courierRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Override
    public Courier getCourierProfile(Integer courierId) {
        return courierRepository.findById(courierId)
                .orElseThrow(() -> new RuntimeException("Courier not found"));
    }

    @Override
    @Transactional
    public Courier updateCourierProfile(Integer courierId, Courier courier) {
        Courier existingCourier = getCourierProfile(courierId);
        existingCourier.setName(courier.getName());
        existingCourier.setEmail(courier.getEmail());
        existingCourier.setPhoneNumber(courier.getPhoneNumber());
        existingCourier.setVehicleType(courier.getVehicleType());
        return courierRepository.save(existingCourier);
    }

    @Override
    @Transactional
    public void updateCourierStatus(Integer courierId, Courier.CourierStatus status) {
        Courier courier = getCourierProfile(courierId);
        courier.setStatus(status);
        courierRepository.save(courier);
    }

    @Override
    public boolean isCourierAvailable(Integer courierId) {
        Courier courier = getCourierProfile(courierId);
        return courier.getStatus() == Courier.CourierStatus.Available;
    }

    @Override
    public List<Order> getAvailableOrders() {
        return orderRepository.findByStatus(Order.OrderStatus.PENDING);
    }

    @Override
    public List<Order> getActiveDeliveries(Integer courierId) {
        return orderRepository.findByCourierCourierIdAndStatus(courierId, Order.OrderStatus.OUT_FOR_DELIVERY);
    }

    @Override
    public List<Order> getPastDeliveries(Integer courierId) {
        return orderRepository.findByCourierCourierIdAndStatus(courierId, Order.OrderStatus.DELIVERED);
    }

    @Override
    @Transactional
    public Order acceptOrder(Integer courierId, Integer orderId) {
        Courier courier = getCourierProfile(courierId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new RuntimeException("Order is not available for delivery");
        }

        order.setCourier(courier);
        order.setStatus(Order.OrderStatus.OUT_FOR_DELIVERY);
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order completeDelivery(Integer courierId, Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getCourier().getCourierId() != courierId) {
            throw new RuntimeException("This order is not assigned to you");
        }

        if (order.getStatus() != Order.OrderStatus.OUT_FOR_DELIVERY) {
            throw new RuntimeException("Order is not out for delivery");
        }

        order.setStatus(Order.OrderStatus.DELIVERED);
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order cancelDelivery(Integer courierId, Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getCourier().getCourierId() != courierId) {
            throw new RuntimeException("This order is not assigned to you");
        }

        if (order.getStatus() != Order.OrderStatus.OUT_FOR_DELIVERY) {
            throw new RuntimeException("Order is not out for delivery");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

    @Override
    public Double getTotalEarnings(Integer courierId) {
        Courier courier = getCourierProfile(courierId);
        return courier.getEarnings().doubleValue();
    }
} 