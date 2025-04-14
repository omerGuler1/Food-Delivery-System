package com.hufds.service;

import com.hufds.dto.AdminLoginDTO;
import com.hufds.dto.AdminRegisterDTO;
import com.hufds.dto.AdminResponseDTO;
import com.hufds.entity.AdminUser;
import com.hufds.exception.CustomException;
import com.hufds.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final AdminRepository adminRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AdminResponseDTO register(AdminRegisterDTO registerDTO) {
        // Check if email already exists
        adminRepository.findByEmail(registerDTO.getEmail()).ifPresent(a -> {
            throw new CustomException("Email already registered", HttpStatus.CONFLICT);
        });

        // Create new admin
        AdminUser admin = new AdminUser();
        admin.setName(registerDTO.getName());
        admin.setEmail(registerDTO.getEmail());
        admin.setPassword(passwordEncoder.encode(registerDTO.getPassword()));

        AdminUser savedAdmin = adminRepository.save(admin);

        // Generate JWT
        String token = jwtService.generateToken(savedAdmin.getEmail(), savedAdmin.getAdminId(), "admin");

        return AdminResponseDTO.builder()
                .token(token)
                .adminId(savedAdmin.getAdminId())
                .name(savedAdmin.getName())
                .email(savedAdmin.getEmail())
                .build();
    }

    public AdminResponseDTO login(AdminLoginDTO loginDTO) {
        AdminUser admin = adminRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new CustomException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(loginDTO.getPassword(), admin.getPassword())) {
            throw new CustomException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        String token = jwtService.generateToken(admin.getEmail(), admin.getAdminId(), "admin");

        return AdminResponseDTO.builder()
                .token(token)
                .adminId(admin.getAdminId())
                .name(admin.getName())
                .email(admin.getEmail())
                .build();
    }
}
