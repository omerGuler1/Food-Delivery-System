package com.hufds.controller;

import com.hufds.dto.RestaurantLoginDTO;
import com.hufds.dto.RestaurantRegisterDTO;
import com.hufds.dto.RestaurantResponseDTO;
import com.hufds.service.RestaurantAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/restaurant/auth")
@RequiredArgsConstructor
public class RestaurantAuthController {

    private final RestaurantAuthService restaurantAuthService;

    @PostMapping("/register")
    public ResponseEntity<RestaurantResponseDTO> register(@Valid @RequestBody RestaurantRegisterDTO registerDTO) {
        RestaurantResponseDTO response = restaurantAuthService.register(registerDTO);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<RestaurantResponseDTO> login(@Valid @RequestBody RestaurantLoginDTO loginDTO) {
        RestaurantResponseDTO response = restaurantAuthService.login(loginDTO);
        return ResponseEntity.ok(response);
    }
}