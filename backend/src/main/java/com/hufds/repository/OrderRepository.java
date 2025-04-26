package com.hufds.repository;

import com.hufds.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByCustomerCustomerId(Integer customerId);
    List<Order> findByCustomerCustomerIdAndRestaurantRestaurantId(Integer customerId, Integer restaurantId);
}
