package com.hufds.service.impl;

import com.hufds.dto.CourierLoginDTO;
import com.hufds.dto.CourierRegisterDTO;
import com.hufds.dto.CourierResponseDTO;
import com.hufds.entity.Courier;
import com.hufds.exception.CustomException;
import com.hufds.repository.CourierRepository;
import com.hufds.service.CourierAuthService;
import com.hufds.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CourierAuthServiceImpl implements CourierAuthService {

    private final CourierRepository courierRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public CourierResponseDTO register(CourierRegisterDTO registerDTO) {
        // Check if email already exists
        courierRepository.findByEmail(registerDTO.getEmail()).ifPresent(c -> {
            throw new CustomException("Email already registered", HttpStatus.CONFLICT);
        });

        // Create new courier
        Courier courier = new Courier();
        courier.setName(registerDTO.getName());
        courier.setEmail(registerDTO.getEmail());
        courier.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        courier.setPhoneNumber(registerDTO.getPhoneNumber());
        courier.setVehicleType(registerDTO.getVehicleType());

        Courier savedCourier = courierRepository.save(courier);

        // Generate JWT
        String token = jwtService.generateToken(savedCourier.getEmail(), savedCourier.getCourierId(), "courier");

        return CourierResponseDTO.builder()
                .token(token)
                .courierId(savedCourier.getCourierId())
                .name(savedCourier.getName())
                .email(savedCourier.getEmail())
                .phoneNumber(savedCourier.getPhoneNumber())
                .vehicleType(savedCourier.getVehicleType())
                .build();
    }

    @Override
    public CourierResponseDTO login(CourierLoginDTO loginDTO) {
        Courier courier = courierRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new CustomException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(loginDTO.getPassword(), courier.getPassword())) {
            throw new CustomException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        String token = jwtService.generateToken(courier.getEmail(), courier.getCourierId(), "courier");

        return CourierResponseDTO.builder()
                .token(token)
                .courierId(courier.getCourierId())
                .name(courier.getName())
                .email(courier.getEmail())
                .phoneNumber(courier.getPhoneNumber())
                .vehicleType(courier.getVehicleType())
                .build();
    }
} 