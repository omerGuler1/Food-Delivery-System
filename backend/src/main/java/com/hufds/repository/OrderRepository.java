package com.hufds.repository;

import com.hufds.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByCustomerCustomerId(Integer customerId);
    List<Order> findByCustomerCustomerIdAndRestaurantRestaurantId(Integer customerId, Integer restaurantId);
    List<Order> findByStatus(Order.OrderStatus status);
    List<Order> findByCourierCourierIdAndStatus(Integer courierId, Order.OrderStatus status);
    List<Order> findByRestaurantRestaurantId(Integer restaurantId);
    List<Order> findByRestaurantRestaurantIdAndStatus(Integer restaurantId, Order.OrderStatus status);
}
