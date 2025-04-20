package com.hufds.service;

import com.hufds.dto.MenuItemDTO;
import com.hufds.entity.MenuItem;
import com.hufds.entity.Restaurant;
import com.hufds.exception.CustomException;
import com.hufds.repository.MenuItemRepository;
import com.hufds.repository.RestaurantRepository;
import com.hufds.service.impl.MenuItemServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MenuItemServiceTest {

    @Mock
    private MenuItemRepository menuItemRepository;

    @Mock
    private RestaurantRepository restaurantRepository;

    @InjectMocks
    private MenuItemServiceImpl menuItemService;

    private Restaurant testRestaurant;
    private MenuItem testMenuItem;
    private MenuItemDTO testMenuItemDTO;

    @BeforeEach
    void setUp() {
        // Setup test restaurant
        testRestaurant = new Restaurant();
        testRestaurant.setRestaurantId(1);
        testRestaurant.setName("Test Restaurant");
        testRestaurant.setEmail("test@restaurant.com");

        // Setup test menu item
        testMenuItem = new MenuItem();
        testMenuItem.setMenuItemId(1);
        testMenuItem.setName("Test Item");
        testMenuItem.setCategory("Test Category");
        testMenuItem.setDescription("Test Description");
        testMenuItem.setPrice(BigDecimal.valueOf(10.99));
        testMenuItem.setAvailability(true);
        testMenuItem.setRestaurant(testRestaurant);
        testMenuItem.setCreatedAt(LocalDateTime.now());

        // Setup test DTO
        testMenuItemDTO = MenuItemDTO.builder()
                .name("Test Item")
                .category("Test Category")
                .description("Test Description")
                .price(BigDecimal.valueOf(10.99))
                .availability(true)
                .build();
    }

    @Test
    void createMenuItem_Success() {
        // Arrange
        when(restaurantRepository.findById(1)).thenReturn(Optional.of(testRestaurant));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);

        // Act
        MenuItem result = menuItemService.createMenuItem(1, testMenuItemDTO);

        // Assert
        assertNotNull(result);
        assertEquals(testMenuItem.getName(), result.getName());
        assertEquals(testMenuItem.getPrice(), result.getPrice());
        assertEquals(testMenuItem.getCategory(), result.getCategory());
        verify(menuItemRepository).save(any(MenuItem.class));
    }

    @Test
    void createMenuItem_RestaurantNotFound() {
        // Arrange
        when(restaurantRepository.findById(1)).thenReturn(Optional.empty());

        // Act & Assert
        CustomException exception = assertThrows(CustomException.class,
                () -> menuItemService.createMenuItem(1, testMenuItemDTO));
        assertEquals("Restaurant not found", exception.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }

    @Test
    void updateMenuItem_Success() {
        // Arrange
        when(menuItemRepository.findByMenuItemIdAndDeletedAtIsNull(1))
                .thenReturn(Optional.of(testMenuItem));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);

        // Act
        MenuItem result = menuItemService.updateMenuItem(1, testMenuItemDTO, 1);

        // Assert
        assertNotNull(result);
        assertEquals(testMenuItemDTO.getName(), result.getName());
        assertEquals(testMenuItemDTO.getPrice(), result.getPrice());
        verify(menuItemRepository).save(any(MenuItem.class));
    }

    @Test
    void updateMenuItem_NotFound() {
        // Arrange
        when(menuItemRepository.findByMenuItemIdAndDeletedAtIsNull(1))
                .thenReturn(Optional.empty());

        // Act & Assert
        CustomException exception = assertThrows(CustomException.class,
                () -> menuItemService.updateMenuItem(1, testMenuItemDTO, 1));
        assertEquals("Menu item not found", exception.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }

    @Test
    void updateMenuItem_WrongRestaurant() {
        // Arrange
        testMenuItem.getRestaurant().setRestaurantId(2); // Different restaurant
        when(menuItemRepository.findByMenuItemIdAndDeletedAtIsNull(1))
                .thenReturn(Optional.of(testMenuItem));

        // Act & Assert
        CustomException exception = assertThrows(CustomException.class,
                () -> menuItemService.updateMenuItem(1, testMenuItemDTO, 1));
        assertEquals("Menu item does not belong to this restaurant", exception.getMessage());
        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
    }

    @Test
    void deleteMenuItem_Success() {
        // Arrange
        when(menuItemRepository.findByMenuItemIdAndDeletedAtIsNull(1))
                .thenReturn(Optional.of(testMenuItem));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);

        // Act
        menuItemService.deleteMenuItem(1, 1);

        // Assert
        verify(menuItemRepository).save(any(MenuItem.class));
        assertNotNull(testMenuItem.getDeletedAt());
    }

    @Test
    void getMenuItemById_Success() {
        // Arrange
        when(menuItemRepository.findByMenuItemIdAndDeletedAtIsNull(1))
                .thenReturn(Optional.of(testMenuItem));

        // Act
        MenuItem result = menuItemService.getMenuItemById(1, 1);

        // Assert
        assertNotNull(result);
        assertEquals(testMenuItem.getMenuItemId(), result.getMenuItemId());
    }

    @Test
    void getAllMenuItems_Success() {
        // Arrange
        List<MenuItem> menuItems = Arrays.asList(testMenuItem);
        when(menuItemRepository.findByRestaurantRestaurantIdAndDeletedAtIsNull(1))
                .thenReturn(menuItems);

        // Act
        List<MenuItem> result = menuItemService.getAllMenuItems(1);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testMenuItem.getMenuItemId(), result.get(0).getMenuItemId());
    }

    @Test
    void getAvailableMenuItems_Success() {
        // Arrange
        List<MenuItem> menuItems = Arrays.asList(testMenuItem);
        when(menuItemRepository.findByRestaurantRestaurantIdAndAvailabilityTrueAndDeletedAtIsNull(1))
                .thenReturn(menuItems);

        // Act
        List<MenuItem> result = menuItemService.getAvailableMenuItems(1);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).getAvailability());
    }

    @Test
    void getMenuItemsByCategory_Success() {
        // Arrange
        List<MenuItem> menuItems = Arrays.asList(testMenuItem);
        when(menuItemRepository.findByRestaurantRestaurantIdAndCategoryAndDeletedAtIsNull(1, "Test Category"))
                .thenReturn(menuItems);

        // Act
        List<MenuItem> result = menuItemService.getMenuItemsByCategory(1, "Test Category");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Category", result.get(0).getCategory());
    }

    @Test
    void toggleAvailability_Success() {
        // Arrange
        when(menuItemRepository.findByMenuItemIdAndDeletedAtIsNull(1))
                .thenReturn(Optional.of(testMenuItem));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);

        // Act
        MenuItem result = menuItemService.toggleAvailability(1, 1);

        // Assert
        assertNotNull(result);
        assertFalse(result.getAvailability()); // Should be toggled from true to false
        verify(menuItemRepository).save(any(MenuItem.class));
    }
} 