package com.hufds.service;

import com.hufds.dto.RestaurantLoginDTO;
import com.hufds.dto.RestaurantRegisterDTO;
import com.hufds.dto.RestaurantResponseDTO;
import com.hufds.entity.Restaurant;
import com.hufds.exception.CustomException;
import com.hufds.repository.RestaurantRepository;
import com.hufds.service.impl.RestaurantAuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RestaurantAuthServiceTest {

    @Mock
    private RestaurantRepository restaurantRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private RestaurantAuthServiceImpl restaurantAuthService;

    private RestaurantRegisterDTO registerDTO;
    private RestaurantLoginDTO loginDTO;
    private Restaurant testRestaurant;
    private Restaurant deletedRestaurant;

    @BeforeEach
    void setUp() {
        // Setup register DTO
        registerDTO = new RestaurantRegisterDTO();
        registerDTO.setName("Test Restaurant");
        registerDTO.setEmail("test@restaurant.com");
        registerDTO.setPassword("password123");
        registerDTO.setPhoneNumber("+1234567890");
        registerDTO.setCuisineType("Italian");

        // Setup login DTO
        loginDTO = new RestaurantLoginDTO();
        loginDTO.setEmail("test@restaurant.com");
        loginDTO.setPassword("password123");

        // Setup test restaurant
        testRestaurant = new Restaurant();
        testRestaurant.setRestaurantId(1);
        testRestaurant.setName("Test Restaurant");
        testRestaurant.setEmail("test@restaurant.com");
        testRestaurant.setPassword("encodedPassword");
        testRestaurant.setPhoneNumber("+1234567890");
        testRestaurant.setCuisineType("Italian");
        testRestaurant.setRating(0f);

        // Setup deleted restaurant
        deletedRestaurant = new Restaurant();
        deletedRestaurant.setRestaurantId(2);
        deletedRestaurant.setName("Deleted Restaurant");
        deletedRestaurant.setEmail("deleted@restaurant.com");
        deletedRestaurant.setPassword("encodedPassword");
        deletedRestaurant.setDeletedAt(LocalDateTime.now());
    }

    @Test
    void register_ShouldRegisterNewRestaurant_WhenEmailNotExists() {
        // Arrange
        when(restaurantRepository.findByEmail(any())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(restaurantRepository.save(any())).thenReturn(testRestaurant);
        when(jwtService.generateToken(any(), any(), any())).thenReturn("testToken");

        // Act
        RestaurantResponseDTO response = restaurantAuthService.register(registerDTO);

        // Assert
        assertNotNull(response);
        assertEquals(testRestaurant.getRestaurantId(), response.getRestaurantId());
        assertEquals(testRestaurant.getName(), response.getName());
        assertEquals(testRestaurant.getEmail(), response.getEmail());
        assertEquals(testRestaurant.getPhoneNumber(), response.getPhoneNumber());
        assertEquals(testRestaurant.getCuisineType(), response.getCuisineType());
        assertEquals(testRestaurant.getRating(), response.getRating());
        assertEquals("testToken", response.getToken());

        verify(restaurantRepository).findByEmail(registerDTO.getEmail());
        verify(passwordEncoder).encode(registerDTO.getPassword());
        verify(restaurantRepository).save(any(Restaurant.class));
        verify(jwtService).generateToken(testRestaurant.getEmail(), testRestaurant.getRestaurantId(), "restaurant");
    }

    @Test
    void register_ShouldThrowException_WhenEmailAlreadyExists() {
        // Arrange
        when(restaurantRepository.findByEmail(any())).thenReturn(Optional.of(testRestaurant));

        // Act & Assert
        CustomException exception = assertThrows(CustomException.class,
                () -> restaurantAuthService.register(registerDTO));

        assertEquals("Email already registered", exception.getMessage());
        assertEquals(HttpStatus.CONFLICT, exception.getStatus());

        verify(restaurantRepository).findByEmail(registerDTO.getEmail());
        verify(restaurantRepository, never()).save(any());
    }

    @Test
    void login_ShouldLoginSuccessfully_WhenCredentialsAreValid() {
        // Arrange
        when(restaurantRepository.findByEmail(any())).thenReturn(Optional.of(testRestaurant));
        when(passwordEncoder.matches(any(), any())).thenReturn(true);
        when(jwtService.generateToken(any(), any(), any())).thenReturn("testToken");

        // Act
        RestaurantResponseDTO response = restaurantAuthService.login(loginDTO);

        // Assert
        assertNotNull(response);
        assertEquals(testRestaurant.getRestaurantId(), response.getRestaurantId());
        assertEquals(testRestaurant.getName(), response.getName());
        assertEquals(testRestaurant.getEmail(), response.getEmail());
        assertEquals(testRestaurant.getPhoneNumber(), response.getPhoneNumber());
        assertEquals(testRestaurant.getCuisineType(), response.getCuisineType());
        assertEquals(testRestaurant.getRating(), response.getRating());
        assertEquals("testToken", response.getToken());

        verify(restaurantRepository).findByEmail(loginDTO.getEmail());
        verify(passwordEncoder).matches(loginDTO.getPassword(), testRestaurant.getPassword());
        verify(jwtService).generateToken(testRestaurant.getEmail(), testRestaurant.getRestaurantId(), "restaurant");
    }

    @Test
    void login_ShouldThrowException_WhenEmailNotFound() {
        // Arrange
        when(restaurantRepository.findByEmail(any())).thenReturn(Optional.empty());

        // Act & Assert
        CustomException exception = assertThrows(CustomException.class,
                () -> restaurantAuthService.login(loginDTO));

        assertEquals("Invalid email or password", exception.getMessage());
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());

        verify(restaurantRepository).findByEmail(loginDTO.getEmail());
        verify(passwordEncoder, never()).matches(any(), any());
    }

    @Test
    void login_ShouldThrowException_WhenPasswordIsInvalid() {
        // Arrange
        when(restaurantRepository.findByEmail(any())).thenReturn(Optional.of(testRestaurant));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        // Act & Assert
        CustomException exception = assertThrows(CustomException.class,
                () -> restaurantAuthService.login(loginDTO));

        assertEquals("Invalid email or password", exception.getMessage());
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());

        verify(restaurantRepository).findByEmail(loginDTO.getEmail());
        verify(passwordEncoder).matches(loginDTO.getPassword(), testRestaurant.getPassword());
    }

    @Test
    void login_ShouldThrowException_WhenAccountIsDeleted() {
        // Arrange
        when(restaurantRepository.findByEmail(any())).thenReturn(Optional.of(deletedRestaurant));

        // Act & Assert
        CustomException exception = assertThrows(CustomException.class,
                () -> restaurantAuthService.login(loginDTO));

        assertEquals("Account has been deleted", exception.getMessage());
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());

        verify(restaurantRepository).findByEmail(loginDTO.getEmail());
        verify(passwordEncoder, never()).matches(any(), any());
    }
} 