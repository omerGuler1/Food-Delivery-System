package com.hufds.service;

import com.hufds.dto.RestaurantProfileDTO;
import com.hufds.entity.Restaurant;
import com.hufds.exception.CustomException;
import com.hufds.repository.RestaurantRepository;
import com.hufds.service.impl.RestaurantProfileServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RestaurantProfileServiceTest {

    @Mock
    private RestaurantRepository restaurantRepository;

    @InjectMocks
    private RestaurantProfileServiceImpl restaurantProfileService;

    private Restaurant testRestaurant;
    private Restaurant updatedRestaurant;
    private RestaurantProfileDTO testProfileDTO;
    private RestaurantProfileDTO.AddressDTO testAddressDTO;
    private RestaurantProfileDTO.LocationDTO testLocationDTO;

    @BeforeEach
    void setUp() {
        // Setup test restaurant
        testRestaurant = new Restaurant();
        testRestaurant.setRestaurantId(1);
        testRestaurant.setName("Test Restaurant");
        testRestaurant.setEmail("test@restaurant.com");
        testRestaurant.setPhoneNumber("+1234567890");
        testRestaurant.setCuisineType("Italian");
        testRestaurant.setStreet("123 Test St");
        testRestaurant.setCity("Test City");
        testRestaurant.setState("TS");
        testRestaurant.setZipCode("12345");
        testRestaurant.setCountry("Test Country");
        testRestaurant.setLatitude(new BigDecimal("40.7128"));
        testRestaurant.setLongitude(new BigDecimal("-74.0060"));

        // Setup address DTO
        testAddressDTO = RestaurantProfileDTO.AddressDTO.builder()
                .street("456 New St")
                .city("New City")
                .state("NS")
                .zipCode("54321")
                .country("New Country")
                .build();

        // Setup location DTO
        testLocationDTO = RestaurantProfileDTO.LocationDTO.builder()
                .latitude(new BigDecimal("34.0522"))
                .longitude(new BigDecimal("-118.2437"))
                .build();

        // Setup updated restaurant with new values
        updatedRestaurant = new Restaurant();
        updatedRestaurant.setRestaurantId(1);
        updatedRestaurant.setName("Updated Restaurant");
        updatedRestaurant.setEmail("updated@restaurant.com");
        updatedRestaurant.setPhoneNumber("+9876543210");
        updatedRestaurant.setCuisineType("Mexican");
        updatedRestaurant.setStreet(testAddressDTO.getStreet());
        updatedRestaurant.setCity(testAddressDTO.getCity());
        updatedRestaurant.setState(testAddressDTO.getState());
        updatedRestaurant.setZipCode(testAddressDTO.getZipCode());
        updatedRestaurant.setCountry(testAddressDTO.getCountry());
        updatedRestaurant.setLatitude(testLocationDTO.getLatitude());
        updatedRestaurant.setLongitude(testLocationDTO.getLongitude());

        // Setup profile DTO
        testProfileDTO = RestaurantProfileDTO.builder()
                .name("Updated Restaurant")
                .email("updated@restaurant.com")
                .phoneNumber("+9876543210")
                .cuisineType("Mexican")
                .build();
    }

    @Test
    void getProfile_ShouldReturnProfile_WhenRestaurantExists() {
        // Arrange
        when(restaurantRepository.findById(any())).thenReturn(Optional.of(testRestaurant));

        // Act
        RestaurantProfileDTO result = restaurantProfileService.getProfile(1);

        // Assert
        assertNotNull(result);
        assertEquals(testRestaurant.getName(), result.getName());
        assertEquals(testRestaurant.getEmail(), result.getEmail());
        assertEquals(testRestaurant.getPhoneNumber(), result.getPhoneNumber());
        assertEquals(testRestaurant.getCuisineType(), result.getCuisineType());
        assertNotNull(result.getAddress());
        assertEquals(testRestaurant.getStreet(), result.getAddress().getStreet());
        assertNotNull(result.getLocation());
        assertEquals(testRestaurant.getLatitude(), result.getLocation().getLatitude());
    }

    @Test
    void getProfile_ShouldThrowException_WhenRestaurantNotFound() {
        // Arrange
        when(restaurantRepository.findById(any())).thenReturn(Optional.empty());

        // Act & Assert
        CustomException exception = assertThrows(CustomException.class,
                () -> restaurantProfileService.getProfile(1));
        assertEquals("Restaurant not found", exception.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }

    @Test
    void updateProfile_ShouldUpdateProfile_WhenValidData() {
        // Arrange
        when(restaurantRepository.findById(any())).thenReturn(Optional.of(testRestaurant));
        when(restaurantRepository.save(any())).thenReturn(updatedRestaurant);

        // Act
        RestaurantProfileDTO result = restaurantProfileService.updateProfile(1, testProfileDTO);

        // Assert
        assertNotNull(result);
        assertEquals(testProfileDTO.getName(), result.getName());
        assertEquals(testProfileDTO.getEmail(), result.getEmail());
        assertEquals(testProfileDTO.getPhoneNumber(), result.getPhoneNumber());
        assertEquals(testProfileDTO.getCuisineType(), result.getCuisineType());
        verify(restaurantRepository).save(any(Restaurant.class));
    }

    @Test
    void updateAddress_ShouldUpdateAddress_WhenValidData() {
        // Arrange
        when(restaurantRepository.findById(any())).thenReturn(Optional.of(testRestaurant));
        when(restaurantRepository.save(any())).thenReturn(updatedRestaurant);

        // Act
        restaurantProfileService.updateAddress(1, testAddressDTO);

        // Assert
        verify(restaurantRepository).save(any(Restaurant.class));
        assertEquals(testAddressDTO.getStreet(), updatedRestaurant.getStreet());
        assertEquals(testAddressDTO.getCity(), updatedRestaurant.getCity());
        assertEquals(testAddressDTO.getState(), updatedRestaurant.getState());
        assertEquals(testAddressDTO.getZipCode(), updatedRestaurant.getZipCode());
        assertEquals(testAddressDTO.getCountry(), updatedRestaurant.getCountry());
    }

    @Test
    void updateLocation_ShouldUpdateLocation_WhenValidData() {
        // Arrange
        when(restaurantRepository.findById(any())).thenReturn(Optional.of(testRestaurant));
        when(restaurantRepository.save(any())).thenReturn(updatedRestaurant);

        // Act
        restaurantProfileService.updateLocation(1, testLocationDTO);

        // Assert
        verify(restaurantRepository).save(any(Restaurant.class));
        assertEquals(testLocationDTO.getLatitude(), updatedRestaurant.getLatitude());
        assertEquals(testLocationDTO.getLongitude(), updatedRestaurant.getLongitude());
    }

    @Test
    void updateProfile_ShouldUpdateAddressAndLocation_WhenProvided() {
        // Arrange
        testProfileDTO.setAddress(testAddressDTO);
        testProfileDTO.setLocation(testLocationDTO);
        when(restaurantRepository.findById(any())).thenReturn(Optional.of(testRestaurant));
        when(restaurantRepository.save(any())).thenReturn(updatedRestaurant);

        // Act
        RestaurantProfileDTO result = restaurantProfileService.updateProfile(1, testProfileDTO);

        // Assert
        assertNotNull(result);
        assertEquals(testProfileDTO.getName(), result.getName());
        assertNotNull(result.getAddress());
        assertEquals(testAddressDTO.getStreet(), result.getAddress().getStreet());
        assertNotNull(result.getLocation());
        assertEquals(testLocationDTO.getLatitude(), result.getLocation().getLatitude());
        verify(restaurantRepository).save(any(Restaurant.class));
    }
} 