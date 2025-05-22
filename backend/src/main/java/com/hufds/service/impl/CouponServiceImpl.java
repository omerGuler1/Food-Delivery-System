package com.hufds.service.impl;

import com.hufds.dto.CouponDTO;
import com.hufds.dto.CouponRequest;
import com.hufds.dto.CouponValidationResponse;
import com.hufds.entity.Coupon;
import com.hufds.repository.CouponRepository;
import com.hufds.service.CouponService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    @Override
    @Transactional(readOnly = true)
    public CouponValidationResponse validateCouponByName(String couponName, Double orderTotal) {
        BigDecimal orderAmount = BigDecimal.valueOf(orderTotal);
        
        // Find the coupon by name and check if it's active
        var couponOptional = couponRepository.findActiveByName(couponName.toUpperCase(), LocalDate.now());
        
        if (couponOptional.isEmpty()) {
            return CouponValidationResponse.builder()
                .valid(false)
                .message("Coupon not found or expired")
                .build();
        }
        
        Coupon coupon = couponOptional.get();
        
        // Check if the order meets the minimum amount
        if (orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            return CouponValidationResponse.builder()
                .valid(false)
                .couponId(coupon.getId())
                .name(coupon.getName())
                .description(coupon.getDescription())
                .discountAmount(coupon.getDiscountAmount())
                .minOrderAmount(coupon.getMinOrderAmount())
                .message("Order amount does not meet the minimum required amount of " + coupon.getMinOrderAmount())
                .build();
        }
        
        // Coupon is valid
        return CouponValidationResponse.builder()
            .valid(true)
            .couponId(coupon.getId())
            .name(coupon.getName())
            .description(coupon.getDescription())
            .discountAmount(coupon.getDiscountAmount())
            .minOrderAmount(coupon.getMinOrderAmount())
            .message("Coupon applied successfully")
            .build();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CouponDTO> getAllCoupons() {
        return couponRepository.findAll().stream()
                .filter(coupon -> coupon.getDeletedAt() == null)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CouponDTO> getActiveCoupons() {
        return couponRepository.findAllActive().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CouponDTO> getInactiveCoupons() {
        return couponRepository.findAllInactive().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CouponDTO getCouponById(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Coupon not found with id: " + id));
        return mapToDTO(coupon);
    }

    @Override
    @Transactional
    public CouponDTO createCoupon(CouponRequest couponRequest) {
        Coupon coupon = mapToEntity(couponRequest);
        Coupon savedCoupon = couponRepository.save(coupon);
        return mapToDTO(savedCoupon);
    }

    @Override
    @Transactional
    public CouponDTO updateCoupon(Long id, CouponRequest couponRequest) {
        Coupon existingCoupon = couponRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Coupon not found with id: " + id));
        
        updateCouponFromRequest(existingCoupon, couponRequest);
        
        Coupon updatedCoupon = couponRepository.save(existingCoupon);
        return mapToDTO(updatedCoupon);
    }

    @Override
    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Coupon not found with id: " + id));
        
        coupon.setDeletedAt(LocalDateTime.now());
        coupon.setIsActive(false);
        
        couponRepository.save(coupon);
    }

    @Override
    @Transactional
    public CouponDTO toggleCouponStatus(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Coupon not found with id: " + id));
        
        coupon.setIsActive(!coupon.getIsActive());
        
        Coupon updatedCoupon = couponRepository.save(coupon);
        return mapToDTO(updatedCoupon);
    }
    
    private CouponDTO mapToDTO(Coupon coupon) {
        return CouponDTO.builder()
                .id(coupon.getId())
                .name(coupon.getName())
                .description(coupon.getDescription())
                .discountAmount(coupon.getDiscountAmount())
                .minOrderAmount(coupon.getMinOrderAmount())
                .quota(coupon.getQuota())
                .usageCount(coupon.getUsageCount())
                .createdAt(coupon.getCreatedAt())
                .endDate(coupon.getEndDate())
                .isActive(coupon.getIsActive())
                .build();
    }
    
    private Coupon mapToEntity(CouponRequest request) {
        return Coupon.builder()
                .name(request.getName().toUpperCase())
                .description(request.getDescription())
                .discountAmount(request.getDiscountAmount())
                .minOrderAmount(request.getMinOrderAmount())
                .quota(request.getQuota())
                .usageCount(0)
                .endDate(request.getEndDate())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
    }
    
    private void updateCouponFromRequest(Coupon coupon, CouponRequest request) {
        coupon.setName(request.getName().toUpperCase());
        coupon.setDescription(request.getDescription());
        coupon.setDiscountAmount(request.getDiscountAmount());
        coupon.setMinOrderAmount(request.getMinOrderAmount());
        coupon.setQuota(request.getQuota());
        coupon.setEndDate(request.getEndDate());
        
        if (request.getIsActive() != null) {
            coupon.setIsActive(request.getIsActive());
        }
    }
} 