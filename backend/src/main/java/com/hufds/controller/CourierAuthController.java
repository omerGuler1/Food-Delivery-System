package com.hufds.controller;

import com.hufds.dto.CourierLoginDTO;
import com.hufds.dto.CourierRegisterDTO;
import com.hufds.dto.CourierResponseDTO;
import com.hufds.service.CourierAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/courier/auth")
@RequiredArgsConstructor
public class CourierAuthController {

    private final CourierAuthService courierAuthService;

    @PostMapping("/register")
    public ResponseEntity<CourierResponseDTO> register(@Valid @RequestBody CourierRegisterDTO registerDTO) {
        CourierResponseDTO response = courierAuthService.register(registerDTO);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<CourierResponseDTO> login(@Valid @RequestBody CourierLoginDTO loginDTO) {
        CourierResponseDTO response = courierAuthService.login(loginDTO);
        return ResponseEntity.ok(response);
    }
}