package com.hufds.service;

import com.hufds.dto.CouponDTO;
import com.hufds.dto.CouponRequest;
import com.hufds.dto.CouponValidationResponse;

import java.util.List;

public interface CouponService {
    List<CouponDTO> getAllCoupons();
    List<CouponDTO> getActiveCoupons();
    List<CouponDTO> getInactiveCoupons();
    CouponDTO getCouponById(Long id);
    CouponDTO createCoupon(CouponRequest couponRequest);
    CouponDTO updateCoupon(Long id, CouponRequest couponRequest);
    void deleteCoupon(Long id);
    CouponDTO toggleCouponStatus(Long id);
    CouponValidationResponse validateCouponByName(String couponName, Double orderTotal);
} 