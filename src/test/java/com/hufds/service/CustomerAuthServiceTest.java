package com.hufds.service;

import com.hufds.dto.CustomerLoginDTO;
import com.hufds.dto.CustomerRegisterDTO;
import com.hufds.dto.CustomerResponseDTO;
import com.hufds.entity.Customer;
import com.hufds.exception.CustomException;
import com.hufds.repository.CustomerRepository;
import com.hufds.service.impl.CustomerAuthServiceImpl;
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
public class CustomerAuthServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private CustomerAuthServiceImpl customerAuthService;

    private Customer testCustomer;
    private CustomerRegisterDTO registerDTO;
    private CustomerLoginDTO loginDTO;

    @BeforeEach
    void setUp() {
        // Setup test customer
        testCustomer = new Customer();
        testCustomer.setCustomerId(1);
        testCustomer.setName("Test Customer");
        testCustomer.setEmail("test@customer.com");
        testCustomer.setPassword("encodedPassword");
        testCustomer.setPhoneNumber("+1234567890");

        // Setup register DTO
        registerDTO = new CustomerRegisterDTO();
        registerDTO.setName("Test Customer");
        registerDTO.setEmail("test@customer.com");
        registerDTO.setPassword("Test@123");
        registerDTO.setPhoneNumber("+1234567890");

        // Setup login DTO
        loginDTO = new CustomerLoginDTO();
        loginDTO.setEmail("test@customer.com");
        loginDTO.setPassword("Test@123");
    }

    @Test
    void register_ShouldCreateCustomer_WhenValidData() {
        // Arrange
        when(customerRepository.findByEmail(any())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(customerRepository.save(any())).thenReturn(testCustomer);
        when(jwtService.generateToken(any(), any(), any())).thenReturn("testToken");

        // Act
        CustomerResponseDTO result = customerAuthService.register(registerDTO);

        // Assert
        assertNotNull(result);
        assertEquals(testCustomer.getCustomerId(), result.getCustomerId());
        assertEquals(testCustomer.getName(), result.getName());
        assertEquals(testCustomer.getEmail(), result.getEmail());
        assertEquals(testCustomer.getPhoneNumber(), result.getPhoneNumber());
        assertEquals("testToken", result.getToken());
        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    void register_ShouldThrowException_WhenEmailExists() {
        // Arrange
        when(customerRepository.findByEmail(any())).thenReturn(Optional.of(testCustomer));

        // Act & Assert
        CustomException exception = assertThrows(CustomException.class,
                () -> customerAuthService.register(registerDTO));
        assertEquals("Email already registered", exception.getMessage());
        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
    }

    @Test
    void login_ShouldReturnToken_WhenValidCredentials() {
        // Arrange
        when(customerRepository.findByEmail(any())).thenReturn(Optional.of(testCustomer));
        when(passwordEncoder.matches(any(), any())).thenReturn(true);
        when(jwtService.generateToken(any(), any(), any())).thenReturn("testToken");

        // Act
        CustomerResponseDTO result = customerAuthService.login(loginDTO);

        // Assert
        assertNotNull(result);
        assertEquals(testCustomer.getCustomerId(), result.getCustomerId());
        assertEquals(testCustomer.getName(), result.getName());
        assertEquals(testCustomer.getEmail(), result.getEmail());
        assertEquals(testCustomer.getPhoneNumber(), result.getPhoneNumber());
        assertEquals("testToken", result.getToken());
    }

    @Test
    void login_ShouldThrowException_WhenInvalidEmail() {
        // Arrange
        when(customerRepository.findByEmail(any())).thenReturn(Optional.empty());

        // Act & Assert
        CustomException exception = assertThrows(CustomException.class,
                () -> customerAuthService.login(loginDTO));
        assertEquals("Invalid email or password", exception.getMessage());
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
    }

    @Test
    void login_ShouldThrowException_WhenInvalidPassword() {
        // Arrange
        when(customerRepository.findByEmail(any())).thenReturn(Optional.of(testCustomer));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        // Act & Assert
        CustomException exception = assertThrows(CustomException.class,
                () -> customerAuthService.login(loginDTO));
        assertEquals("Invalid email or password", exception.getMessage());
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
    }
} 