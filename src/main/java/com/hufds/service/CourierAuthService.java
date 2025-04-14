package com.hufds.service;

import com.hufds.dto.CourierLoginDTO;
import com.hufds.dto.CourierRegisterDTO;
import com.hufds.dto.CourierResponseDTO;
import com.hufds.entity.Courier;
import com.hufds.entity.Courier.CourierStatus;
import com.hufds.exception.CustomException;
import com.hufds.repository.CourierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class CourierAuthService {

    private final CourierRepository courierRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public CourierResponseDTO register(CourierRegisterDTO registerDTO) {
        if (courierRepository.findByEmail(registerDTO.getEmail()).isPresent()) {
            throw new CustomException("Email already registered", HttpStatus.CONFLICT);
        }

        Courier courier = new Courier();
        courier.setName(registerDTO.getName());
        courier.setEmail(registerDTO.getEmail());
        courier.setPhoneNumber(registerDTO.getPhoneNumber());
        courier.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        courier.setVehicleType(registerDTO.getVehicleType());
        courier.setStatus(CourierStatus.UNAVAILABLE); // default status
        courier.setEarnings(BigDecimal.ZERO);
        courier.setStatus(CourierStatus.AVAILABLE);

        Courier saved = courierRepository.save(courier);

        String token = jwtService.generateToken(saved.getEmail(), saved.getCourierId(), "courier");

        return CourierResponseDTO.builder()
                .token(token)
                .courierId(saved.getCourierId())
                .name(saved.getName())
                .email(saved.getEmail())
                .phoneNumber(saved.getPhoneNumber())
                .vehicleType(saved.getVehicleType())
                .status(saved.getStatus())
                .earnings(saved.getEarnings())
                .build();
    }

    public CourierResponseDTO login(CourierLoginDTO loginDTO) {
        Courier courier = courierRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new CustomException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (courier.getDeletedAt() != null) {
            throw new CustomException("Account has been deleted", HttpStatus.UNAUTHORIZED);
        }

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
                .status(courier.getStatus())
                .earnings(courier.getEarnings())
                .build();
    }
}
