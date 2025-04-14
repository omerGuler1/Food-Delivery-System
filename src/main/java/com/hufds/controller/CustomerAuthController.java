package com.hufds.controller;

import com.hufds.dto.CustomerLoginDTO;
import com.hufds.dto.CustomerRegisterDTO;
import com.hufds.dto.CustomerResponseDTO;
import com.hufds.service.CustomerAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer/auth")
@RequiredArgsConstructor
public class CustomerAuthController {

    private final CustomerAuthService customerAuthService;

    @PostMapping("/register")
    public ResponseEntity<CustomerResponseDTO> register(@Valid @RequestBody CustomerRegisterDTO registerDTO) {
        CustomerResponseDTO response = customerAuthService.register(registerDTO);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<CustomerResponseDTO> login(@Valid @RequestBody CustomerLoginDTO loginDTO) {
        CustomerResponseDTO response = customerAuthService.login(loginDTO);
        return ResponseEntity.ok(response);
    }
}