package com.hufds.repository;

import com.hufds.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    List<Promotion> findByIsActiveAndDeletedAtIsNull(Boolean isActive);
    List<Promotion> findByDeletedAtIsNull();
} 