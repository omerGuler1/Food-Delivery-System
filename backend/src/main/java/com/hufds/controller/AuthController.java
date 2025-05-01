package com.hufds.controller;

import com.hufds.dto.LogoutResponseDTO;
import com.hufds.service.TokenBlacklistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final TokenBlacklistService tokenBlacklistService;

    @PostMapping("/logout")
    public ResponseEntity<LogoutResponseDTO> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");

        LogoutResponseDTO response = new LogoutResponseDTO();

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setMessage("No token provided");
            response.setSuccess(false);
            return ResponseEntity.badRequest().body(response);
        }

        String token = authHeader.substring(7);
        tokenBlacklistService.blacklistToken(token);

        response.setMessage("Logout successful");
        response.setSuccess(true);
        return ResponseEntity.ok(response);
    }
}