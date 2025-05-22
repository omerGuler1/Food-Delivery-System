package com.hufds.repository;

import com.hufds.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    
    @Query("SELECT c FROM Coupon c WHERE c.isActive = true AND c.deletedAt IS NULL")
    List<Coupon> findAllActive();
    
    @Query("SELECT c FROM Coupon c WHERE c.isActive = false AND c.deletedAt IS NULL")
    List<Coupon> findAllInactive();
    
    @Query("SELECT c FROM Coupon c WHERE c.deletedAt IS NOT NULL")
    List<Coupon> findAllDeleted();
    
    @Query("SELECT c FROM Coupon c WHERE c.name = :name AND c.isActive = true " +
           "AND c.deletedAt IS NULL AND (c.endDate IS NULL OR c.endDate >= :today) " +
           "AND (c.quota > c.usageCount OR c.quota = -1)")
    Optional<Coupon> findActiveByName(@Param("name") String name, @Param("today") LocalDate today);
} 