package com.hufds.controller;

import com.hufds.dto.AdminLoginDTO;
import com.hufds.dto.AdminRegisterDTO;
import com.hufds.dto.AdminResponseDTO;
import com.hufds.service.AdminAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    @PostMapping("/register")
    public ResponseEntity<AdminResponseDTO> register(@Valid @RequestBody AdminRegisterDTO registerDTO) {
        AdminResponseDTO response = adminAuthService.register(registerDTO);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AdminResponseDTO> login(@Valid @RequestBody AdminLoginDTO loginDTO) {
        AdminResponseDTO response = adminAuthService.login(loginDTO);
        return ResponseEntity.ok(response);
    }
}
