package com.hufds.controller;

import com.hufds.dto.CourierListDTO;
import com.hufds.entity.Courier;
import com.hufds.repository.CourierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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

    @GetMapping("/verify")
    public ResponseEntity<Void> verifyCourierExists() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        // Check if the courier with this email exists
        Optional<Courier> courier = courierRepository.findByEmail(email);
        if (courier.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        
        // If we get here, the courier exists
        return ResponseEntity.ok().build();
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