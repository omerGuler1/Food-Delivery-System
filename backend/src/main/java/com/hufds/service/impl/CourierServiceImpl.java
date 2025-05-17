package com.hufds.service.impl;

import com.hufds.entity.Courier;
import com.hufds.entity.Order;
import com.hufds.repository.CourierRepository;
import com.hufds.repository.OrderRepository;
import com.hufds.service.CourierService;
import com.hufds.dto.PasswordUpdateDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourierServiceImpl implements CourierService {

    @Autowired
    private CourierRepository courierRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
        return courier.getStatus() == Courier.CourierStatus.AVAILABLE;
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
    public Order completeDelivery(Integer courierId, Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (!order.getCourier().getCourierId().equals(courierId)) {
            throw new RuntimeException("Order is not assigned to this courier");
        }
        
        if (order.getStatus() != Order.OrderStatus.OUT_FOR_DELIVERY) {
            throw new RuntimeException("Order must be out for delivery before completion");
        }
        
        order.setStatus(Order.OrderStatus.DELIVERED);
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order cancelDelivery(Integer courierId, Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (!order.getCourier().getCourierId().equals(courierId)) {
            throw new RuntimeException("Order is not assigned to this courier");
        }
        
        if (order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("Cannot cancel a delivered order");
        }
        
        order.setStatus(Order.OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

    @Override
    public double getTotalEarnings(Integer courierId) {
        return orderRepository.findByCourierCourierIdAndStatus(courierId, Order.OrderStatus.DELIVERED)
                .stream()
                .mapToDouble(order -> order.getTotalPrice().doubleValue())
                .sum();
    }

    @Override
    @Transactional
    public void updatePassword(Integer courierId, PasswordUpdateDTO passwordUpdateDTO) {
        Courier courier = getCourierProfile(courierId);

        if (!passwordEncoder.matches(passwordUpdateDTO.getCurrentPassword(), courier.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (!passwordUpdateDTO.getNewPassword().equals(passwordUpdateDTO.getConfirmPassword())) {
            throw new RuntimeException("New password and confirmation do not match");
        }

        courier.setPassword(passwordEncoder.encode(passwordUpdateDTO.getNewPassword()));
        courierRepository.save(courier);
    }

    @Override
    public Courier updateCourierProfileFromDTO(Integer courierId, com.hufds.dto.CourierProfileDTO dto) {
        Courier existing = getCourierProfile(courierId);
        existing.setName(dto.getName());
        existing.setPhoneNumber(dto.getPhoneNumber());
        existing.setVehicleType(dto.getVehicleType());
        // Do not update email, status, or earnings here unless explicitly allowed
        return courierRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteCourierAccount(Integer courierId) {
        Courier courier = getCourierProfile(courierId);
        courier.setDeletedAt(java.time.LocalDateTime.now());
        courierRepository.save(courier);
    }
} 