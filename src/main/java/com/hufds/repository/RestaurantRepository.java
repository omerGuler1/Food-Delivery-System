package com.hufds.repository;

import com.hufds.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByCuisineType(String cuisineType);
    List<Restaurant> findByNameContainingIgnoreCase(String name);
} 