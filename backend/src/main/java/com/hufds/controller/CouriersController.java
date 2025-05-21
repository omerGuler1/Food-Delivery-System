package com.hufds.controller;

import com.hufds.dto.CourierListDTO;
import com.hufds.entity.Courier;
import com.hufds.repository.CourierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/couriers")
@RequiredArgsConstructor
public class CouriersController {

    private final CourierRepository courierRepository;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @GetMapping
    public ResponseEntity<List<CourierListDTO>> getAllCouriers() {
        List<Courier> couriers = courierRepository.findAll();
        List<CourierListDTO> courierDTOs = couriers.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(courierDTOs);
    }

    @GetMapping("/{courierId}/approval-status")
    public ResponseEntity<?> checkApprovalStatus(@PathVariable Integer courierId) {
        Courier courier = courierRepository.findById(courierId)
                .orElseThrow(() -> new RuntimeException("Courier not found"));
        
        return ResponseEntity.ok(Map.of(
                "courierId", courier.getCourierId(),
                "approvalStatus", courier.getApprovalStatus()
        ));
    }

    private CourierListDTO mapToDTO(Courier courier) {
        return CourierListDTO.builder()
                .courierId(courier.getCourierId())
                .name(courier.getName())
                .email(courier.getEmail())
                .phoneNumber(courier.getPhoneNumber())
                .vehicleType(courier.getVehicleType())
                .status(courier.getStatus())
                .earnings(courier.getEarnings())
                .createdAt(courier.getCreatedAt() != null ? courier.getCreatedAt().format(formatter) : null)
                .approvalStatus(courier.getApprovalStatus())
                .build();
    }
} 