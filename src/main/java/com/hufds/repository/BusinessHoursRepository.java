package com.hufds.repository;

import com.hufds.entity.BusinessHours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusinessHoursRepository extends JpaRepository<BusinessHours, Integer> {
    List<BusinessHours> findByRestaurantRestaurantId(Integer restaurantId);
} 