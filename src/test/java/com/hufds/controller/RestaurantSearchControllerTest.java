package com.hufds.controller;

import com.hufds.dto.RestaurantSearchDTO;
import com.hufds.dto.RestaurantSearchResultDTO;
import com.hufds.service.RestaurantSearchService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class RestaurantSearchControllerTest {

    @Mock
    private RestaurantSearchService restaurantSearchService;

    @InjectMocks
    private RestaurantSearchController restaurantSearchController;

    private RestaurantSearchResultDTO result1;
    private RestaurantSearchResultDTO result2;

    @BeforeEach
    void setUp() {
        // Setup search results
        result1 = RestaurantSearchResultDTO.builder()
            .restaurantId(1)
            .name("Mama Mia Italian")
            .cuisineType("Italian")
            .city("New York")
            .build();

        result2 = RestaurantSearchResultDTO.builder()
            .restaurantId(2)
            .name("Dragon Palace")
            .cuisineType("Chinese")
            .city("New York")
            .build();
    }

    @Test
    void searchRestaurants_ShouldReturnMatchingRestaurants_WhenUsingQueryParams() {
        // Arrange
        when(restaurantSearchService.searchRestaurants(any(RestaurantSearchDTO.class)))
            .thenReturn(Arrays.asList(result1, result2));

        // Act
        ResponseEntity<List<RestaurantSearchResultDTO>> response = restaurantSearchController.searchRestaurants(
            "Mama", "Italian", "New York", "NY", "USA",
            10.0, 50.0, "12:00", 40.7128, -74.0060, 5
        );

        // Assert
        assertEquals(200, response.getStatusCode().value());
        List<RestaurantSearchResultDTO> results = response.getBody();
        assertNotNull(results);
        assertEquals(2, results.size());
        assertEquals("Mama Mia Italian", results.get(0).getName());
        assertEquals("Dragon Palace", results.get(1).getName());
    }

    @Test
    void searchRestaurants_ShouldReturnMatchingRestaurants_WhenUsingRequestBody() {
        // Arrange
        RestaurantSearchDTO searchDTO = RestaurantSearchDTO.builder()
            .name("Mama")
            .cuisineType("Italian")
            .city("New York")
            .build();

        when(restaurantSearchService.searchRestaurants(searchDTO))
            .thenReturn(List.of(result1));

        // Act
        ResponseEntity<List<RestaurantSearchResultDTO>> response = restaurantSearchController.searchRestaurants(searchDTO);

        // Assert
        assertEquals(200, response.getStatusCode().value());
        List<RestaurantSearchResultDTO> results = response.getBody();
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Mama Mia Italian", results.get(0).getName());
    }

    @Test
    void searchRestaurants_ShouldReturnEmptyList_WhenNoMatchesFound() {
        // Arrange
        when(restaurantSearchService.searchRestaurants(any(RestaurantSearchDTO.class)))
            .thenReturn(List.of());

        // Act
        ResponseEntity<List<RestaurantSearchResultDTO>> response = restaurantSearchController.searchRestaurants(
            "NonExistent", null, null, null, null,
            null, null, null, null, null, null
        );

        // Assert
        assertEquals(200, response.getStatusCode().value());
        List<RestaurantSearchResultDTO> results = response.getBody();
        assertNotNull(results);
        assertTrue(results.isEmpty());
    }

    @Test
    void searchRestaurants_ShouldHandleNullParameters() {
        // Arrange
        when(restaurantSearchService.searchRestaurants(any(RestaurantSearchDTO.class)))
            .thenReturn(Arrays.asList(result1, result2));

        // Act
        ResponseEntity<List<RestaurantSearchResultDTO>> response = restaurantSearchController.searchRestaurants(
            null, null, null, null, null,
            null, null, null, null, null, null
        );

        // Assert
        assertEquals(200, response.getStatusCode().value());
        List<RestaurantSearchResultDTO> results = response.getBody();
        assertNotNull(results);
        assertEquals(2, results.size());
    }
} 