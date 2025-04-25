package com.hufds.service;

import com.hufds.dto.AdminLoginDTO;
import com.hufds.dto.AdminRegisterDTO;
import com.hufds.dto.AdminResponseDTO;
import com.hufds.entity.AdminUser;
import com.hufds.exception.CustomException;
import com.hufds.repository.AdminRepository;
import com.hufds.service.impl.AdminAuthServiceImpl;
import com.hufds.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdminAuthServiceTest {

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminAuthServiceImpl adminAuthService;

    private AdminUser testAdmin;
    private AdminRegisterDTO registerDTO;
    private AdminLoginDTO loginDTO;

    @BeforeEach
    void setUp() {
        // Setup test admin
        testAdmin = new AdminUser();
        testAdmin.setAdminId(1);
        testAdmin.setName("Test Admin");
        testAdmin.setEmail("test@admin.com");
        testAdmin.setPassword("encodedPassword");
        testAdmin.setPhoneNumber("+1234567890");

        // Setup register DTO
        registerDTO = new AdminRegisterDTO();
        registerDTO.setName("Test Admin");
        registerDTO.setEmail("test@admin.com");
        registerDTO.setPassword("Test@123");
        registerDTO.setPhoneNumber("+1234567890");

        // Setup login DTO
        loginDTO = new AdminLoginDTO();
        loginDTO.setEmail("test@admin.com");
        loginDTO.setPassword("Test@123");
    }

    @Test
    void register_ShouldCreateAdmin_WhenValidData() {
        // Arrange
        when(adminRepository.findByEmail(any())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(adminRepository.save(any())).thenReturn(testAdmin);
        when(jwtService.generateToken(any(), any(), any())).thenReturn("testToken");

        // Act
        AdminResponseDTO result = adminAuthService.register(registerDTO);

        // Assert
        assertNotNull(result);
        assertEquals(testAdmin.getAdminId(), result.getAdminId());
        assertEquals(testAdmin.getName(), result.getName());
        assertEquals(testAdmin.getEmail(), result.getEmail());
        assertEquals("testToken", result.getToken());
        verify(adminRepository).save(any(AdminUser.class));
    }

    @Test
    void register_ShouldThrowException_WhenEmailExists() {
        // Arrange
        when(adminRepository.findByEmail(any())).thenReturn(Optional.of(testAdmin));

        // Act & Assert
        CustomException exception = assertThrows(CustomException.class,
                () -> adminAuthService.register(registerDTO));
        assertEquals("Email already registered", exception.getMessage());
        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
    }

    @Test
    void login_ShouldReturnToken_WhenValidCredentials() {
        // Arrange
        when(adminRepository.findByEmail(any())).thenReturn(Optional.of(testAdmin));
        when(passwordEncoder.matches(any(), any())).thenReturn(true);
        when(jwtService.generateToken(any(), any(), any())).thenReturn("testToken");

        // Act
        AdminResponseDTO result = adminAuthService.login(loginDTO);

        // Assert
        assertNotNull(result);
        assertEquals(testAdmin.getAdminId(), result.getAdminId());
        assertEquals(testAdmin.getName(), result.getName());
        assertEquals(testAdmin.getEmail(), result.getEmail());
        assertEquals("testToken", result.getToken());
    }

    @Test
    void login_ShouldThrowException_WhenInvalidEmail() {
        // Arrange
        when(adminRepository.findByEmail(any())).thenReturn(Optional.empty());

        // Act & Assert
        CustomException exception = assertThrows(CustomException.class,
                () -> adminAuthService.login(loginDTO));
        assertEquals("Invalid email or password", exception.getMessage());
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
    }

    @Test
    void login_ShouldThrowException_WhenInvalidPassword() {
        // Arrange
        when(adminRepository.findByEmail(any())).thenReturn(Optional.of(testAdmin));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        // Act & Assert
        CustomException exception = assertThrows(CustomException.class,
                () -> adminAuthService.login(loginDTO));
        assertEquals("Invalid email or password", exception.getMessage());
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
    }
} 