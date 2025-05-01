package com.hufds.controller;

import com.hufds.dto.MenuItemSearchDTO;
import com.hufds.dto.MenuItemSearchResultDTO;
import com.hufds.service.MenuItemSearchService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class MenuItemSearchControllerTest {

    @Mock
    private MenuItemSearchService menuItemSearchService;

    @InjectMocks
    private MenuItemSearchController menuItemSearchController;

    private MenuItemSearchResultDTO result1;
    private MenuItemSearchResultDTO result2;

    @BeforeEach
    void setUp() {
        // Setup test results
        result1 = MenuItemSearchResultDTO.builder()
                .id(1)
                .name("Spaghetti Carbonara")
                .category("Pasta")
                .price(new BigDecimal("12.99"))
                .isAvailable(true)
                .restaurantId(1)
                .restaurantName("Mama Mia Italian")
                .build();

        result2 = MenuItemSearchResultDTO.builder()
                .id(2)
                .name("Margherita Pizza")
                .category("Pizza")
                .price(new BigDecimal("14.99"))
                .isAvailable(true)
                .restaurantId(1)
                .restaurantName("Mama Mia Italian")
                .build();
    }

    @Test
    void searchMenuItems_ShouldReturnMatchingItems_WhenUsingQueryParams() {
        // Arrange
        when(menuItemSearchService.searchMenuItems(any(MenuItemSearchDTO.class)))
                .thenReturn(Arrays.asList(result1, result2));

        // Act
        ResponseEntity<List<MenuItemSearchResultDTO>> response = menuItemSearchController.searchMenuItems(
                "Spaghetti", "Pasta", new BigDecimal("10.00"), new BigDecimal("20.00"), true, 1);

        // Assert
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        List<MenuItemSearchResultDTO> results = response.getBody();
        assertNotNull(results);
        assertEquals(2, results.size());
    }

    @Test
    void searchMenuItems_ShouldReturnMatchingItems_WhenUsingRequestBody() {
        // Arrange
        MenuItemSearchDTO searchDTO = MenuItemSearchDTO.builder()
                .name("Spaghetti")
                .category("Pasta")
                .minPrice(new BigDecimal("10.00"))
                .maxPrice(new BigDecimal("20.00"))
                .isAvailable(true)
                .restaurantId(1)
                .build();

        when(menuItemSearchService.searchMenuItems(searchDTO))
                .thenReturn(Arrays.asList(result1, result2));

        // Act
        ResponseEntity<List<MenuItemSearchResultDTO>> response = menuItemSearchController.searchMenuItems(searchDTO);

        // Assert
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        List<MenuItemSearchResultDTO> results = response.getBody();
        assertNotNull(results);
        assertEquals(2, results.size());
    }

    @Test
    void searchMenuItems_ShouldReturnEmptyList_WhenNoMatchesFound() {
        // Arrange
        when(menuItemSearchService.searchMenuItems(any(MenuItemSearchDTO.class)))
                .thenReturn(Arrays.asList());

        // Act
        ResponseEntity<List<MenuItemSearchResultDTO>> response = menuItemSearchController.searchMenuItems(
                "NonExistent", null, null, null, null, 1);

        // Assert
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        List<MenuItemSearchResultDTO> results = response.getBody();
        assertNotNull(results);
        assertTrue(results.isEmpty());
    }

    @Test
    void searchMenuItems_ShouldHandleNullParameters() {
        // Arrange
        when(menuItemSearchService.searchMenuItems(any(MenuItemSearchDTO.class)))
                .thenReturn(Arrays.asList(result1, result2));

        // Act
        ResponseEntity<List<MenuItemSearchResultDTO>> response = menuItemSearchController.searchMenuItems(
                null, null, null, null, null, null);

        // Assert
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        List<MenuItemSearchResultDTO> results = response.getBody();
        assertNotNull(results);
        assertEquals(2, results.size());
    }
} 