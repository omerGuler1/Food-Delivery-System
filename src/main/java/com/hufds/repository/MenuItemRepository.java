package com.hufds.repository;

import com.hufds.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Integer> {
    Optional<MenuItem> findByMenuItemIdAndDeletedAtIsNull(Integer menuItemId);
    List<MenuItem> findByRestaurantRestaurantIdAndDeletedAtIsNull(Integer restaurantId);
    List<MenuItem> findByRestaurantRestaurantIdAndAvailabilityTrueAndDeletedAtIsNull(Integer restaurantId);
    List<MenuItem> findByRestaurantRestaurantIdAndCategoryAndDeletedAtIsNull(Integer restaurantId, String category);
    List<MenuItem> findByNameContainingIgnoreCase(String name);
    List<MenuItem> findByCategoryContainingIgnoreCase(String category);
    List<MenuItem> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);
    List<MenuItem> findByRestaurantRestaurantIdAndNameContainingIgnoreCase(Integer restaurantId, String name);
    List<MenuItem> findByRestaurantRestaurantIdAndCategoryContainingIgnoreCase(Integer restaurantId, String category);
    List<MenuItem> findByRestaurantRestaurantIdAndPriceBetween(Integer restaurantId, BigDecimal minPrice, BigDecimal maxPrice);
    List<MenuItem> findByRestaurantRestaurantId(Integer restaurantId);
    List<MenuItem> findByAvailability(Boolean availability);
    List<MenuItem> findByRestaurantRestaurantIdAndAvailability(Integer restaurantId, Boolean availability);
}
