package com.hufds.controller;

import com.hufds.dto.CouponDTO;
import com.hufds.dto.CouponRequest;
import com.hufds.dto.CouponValidationResponse;
import com.hufds.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @GetMapping
    public ResponseEntity<List<CouponDTO>> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @GetMapping("/active")
    public ResponseEntity<List<CouponDTO>> getActiveCoupons() {
        return ResponseEntity.ok(couponService.getActiveCoupons());
    }

    @GetMapping("/inactive")
    public ResponseEntity<List<CouponDTO>> getInactiveCoupons() {
        return ResponseEntity.ok(couponService.getInactiveCoupons());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CouponDTO> getCouponById(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.getCouponById(id));
    }

    @GetMapping("/validate/{couponName}")
    public ResponseEntity<CouponValidationResponse> validateCoupon(
            @PathVariable String couponName,
            @RequestParam(required = false, defaultValue = "0.0") Double orderTotal) {
        return ResponseEntity.ok(couponService.validateCouponByName(couponName, orderTotal));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponDTO> createCoupon(@RequestBody CouponRequest couponRequest) {
        return new ResponseEntity<>(couponService.createCoupon(couponRequest), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponDTO> updateCoupon(@PathVariable Long id, @RequestBody CouponRequest couponRequest) {
        return ResponseEntity.ok(couponService.updateCoupon(id, couponRequest));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponDTO> toggleCouponStatus(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.toggleCouponStatus(id));
    }
} 