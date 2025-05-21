package com.hufds.repository;

import com.hufds.entity.Customer;
import com.hufds.entity.FavoriteRestaurant;
import com.hufds.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRestaurantRepository extends JpaRepository<FavoriteRestaurant, Integer> {
    List<FavoriteRestaurant> findByCustomer(Customer customer);
    List<FavoriteRestaurant> findByRestaurant(Restaurant restaurant);
    Optional<FavoriteRestaurant> findByCustomerAndRestaurant(Customer customer, Restaurant restaurant);
    boolean existsByCustomerAndRestaurant(Customer customer, Restaurant restaurant);
    void deleteByCustomerAndRestaurant(Customer customer, Restaurant restaurant);
} 