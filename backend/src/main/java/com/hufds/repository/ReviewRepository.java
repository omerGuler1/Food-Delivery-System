package com.hufds.repository;

import com.hufds.entity.Review;
import com.hufds.entity.Review.ReviewRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByCustomerCustomerId(Integer customerId);
    List<Review> findByTargetIdAndRole(Integer targetId, ReviewRole role);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.targetId = :targetId AND r.role = :role")
    Double calculateAverageRating(@Param("targetId") Integer targetId, @Param("role") ReviewRole role);
    
    List<Review> findByOrderOrderId(Integer orderId);
    
    Optional<Review> findByOrderOrderIdAndCustomerCustomerIdAndRole(Integer orderId, Integer customerId, ReviewRole role);
    
    boolean existsByOrderOrderIdAndCustomerCustomerIdAndRole(Integer orderId, Integer customerId, ReviewRole role);
} 