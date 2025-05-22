package com.hufds.controller;

import com.hufds.dto.FeeDTO;
import com.hufds.dto.FeeUpdateRequest;
import com.hufds.service.FeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fees")
@RequiredArgsConstructor
public class FeeController {

    private final FeeService feeService;

    @GetMapping("/delivery")
    public ResponseEntity<FeeDTO> getDeliveryFee() {
        return ResponseEntity.ok(feeService.getDeliveryFee());
    }

    @PutMapping("/delivery")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeeDTO> updateDeliveryFee(@RequestBody FeeUpdateRequest request) {
        return ResponseEntity.ok(feeService.updateDeliveryFee(request));
    }
} 