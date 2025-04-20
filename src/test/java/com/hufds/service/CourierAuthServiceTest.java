package com.hufds.service;

import com.hufds.dto.CourierLoginDTO;
import com.hufds.dto.CourierRegisterDTO;
import com.hufds.dto.CourierResponseDTO;
import com.hufds.entity.Courier;
import com.hufds.exception.CustomException;
import com.hufds.repository.CourierRepository;
import com.hufds.service.impl.CourierAuthServiceImpl;
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
public class CourierAuthServiceTest {

    @Mock
    private CourierRepository courierRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private CourierAuthServiceImpl courierAuthService;

    private Courier testCourier;
    private CourierRegisterDTO registerDTO;
    private CourierLoginDTO loginDTO;

    @BeforeEach
    void setUp() {
        // Setup test courier
        testCourier = new Courier();
        testCourier.setCourierId(1);
        testCourier.setName("Test Courier");
        testCourier.setEmail("test@example.com");
        testCourier.setPassword("encodedPassword");
        testCourier.setPhoneNumber("+1234567890");
        testCourier.setVehicleType("Bicycle");

        // Setup register DTO
        registerDTO = new CourierRegisterDTO();
        registerDTO.setName("Test Courier");
        registerDTO.setEmail("test@example.com");
        registerDTO.setPassword("Test@123");
        registerDTO.setPhoneNumber("+1234567890");
        registerDTO.setVehicleType("Bicycle");

        // Setup login DTO
        loginDTO = new CourierLoginDTO();
        loginDTO.setEmail("test@example.com");
        loginDTO.setPassword("Test@123");
    }

    @Test
    void register_ShouldCreateCourier_WhenValidData() {
        // Arrange
        when(courierRepository.findByEmail(any())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(courierRepository.save(any())).thenReturn(testCourier);
        when(jwtService.generateToken(any(), any(), any())).thenReturn("testToken");

        // Act
        CourierResponseDTO result = courierAuthService.register(registerDTO);

        // Assert
        assertNotNull(result);
        assertEquals(testCourier.getCourierId(), result.getCourierId());
        assertEquals(testCourier.getName(), result.getName());
        assertEquals(testCourier.getEmail(), result.getEmail());
        assertEquals(testCourier.getPhoneNumber(), result.getPhoneNumber());
        assertEquals(testCourier.getVehicleType(), result.getVehicleType());
        assertEquals("testToken", result.getToken());
        verify(courierRepository).save(any(Courier.class));
    }

    @Test
    void register_ShouldThrowException_WhenEmailExists() {
        // Arrange
        when(courierRepository.findByEmail(any())).thenReturn(Optional.of(testCourier));

        // Act & Assert
        CustomException exception = assertThrows(CustomException.class,
                () -> courierAuthService.register(registerDTO));
        assertEquals("Email already registered", exception.getMessage());
        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
    }

    @Test
    void login_ShouldReturnToken_WhenValidCredentials() {
        // Arrange
        when(courierRepository.findByEmail(any())).thenReturn(Optional.of(testCourier));
        when(passwordEncoder.matches(any(), any())).thenReturn(true);
        when(jwtService.generateToken(any(), any(), any())).thenReturn("testToken");

        // Act
        CourierResponseDTO result = courierAuthService.login(loginDTO);

        // Assert
        assertNotNull(result);
        assertEquals(testCourier.getCourierId(), result.getCourierId());
        assertEquals(testCourier.getName(), result.getName());
        assertEquals(testCourier.getEmail(), result.getEmail());
        assertEquals("testToken", result.getToken());
    }

    @Test
    void login_ShouldThrowException_WhenInvalidEmail() {
        // Arrange
        when(courierRepository.findByEmail(any())).thenReturn(Optional.empty());

        // Act & Assert
        CustomException exception = assertThrows(CustomException.class,
                () -> courierAuthService.login(loginDTO));
        assertEquals("Invalid email or password", exception.getMessage());
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
    }

    @Test
    void login_ShouldThrowException_WhenInvalidPassword() {
        // Arrange
        when(courierRepository.findByEmail(any())).thenReturn(Optional.of(testCourier));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        // Act & Assert
        CustomException exception = assertThrows(CustomException.class,
                () -> courierAuthService.login(loginDTO));
        assertEquals("Invalid email or password", exception.getMessage());
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
    }
}