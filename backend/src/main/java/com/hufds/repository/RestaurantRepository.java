package com.hufds.repository;

import com.hufds.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Integer> {
    Optional<Restaurant> findByEmail(String email);
    
    // Find all non-deleted restaurants
    List<Restaurant> findAllByDeletedAtIsNull();
    
    // Search methods
    List<Restaurant> findByNameContainingIgnoreCase(String name);
    List<Restaurant> findByCuisineTypeContainingIgnoreCase(String cuisineType);
    List<Restaurant> findByCityContainingIgnoreCase(String city);
    List<Restaurant> findByStateContainingIgnoreCase(String state);
    List<Restaurant> findByCountryContainingIgnoreCase(String country);
    
    // Location-based search
    @Query("SELECT r FROM Restaurant r WHERE " +
           "6371 * acos(cos(radians(:latitude)) * cos(radians(r.latitude)) * " +
           "cos(radians(r.longitude) - radians(:longitude)) + " +
           "sin(radians(:latitude)) * sin(radians(r.latitude))) <= :maxDistance " +
           "AND r.deletedAt IS NULL")
    List<Restaurant> findByLocationWithinDistance(
        @Param("latitude") BigDecimal latitude,
        @Param("longitude") BigDecimal longitude,
        @Param("maxDistance") double maxDistance
    );

    List<Restaurant> findByApprovalStatus(Restaurant.ApprovalStatus status);
}
