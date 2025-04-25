package com.hufds.service;

import com.hufds.dto.MenuItemSearchDTO;
import com.hufds.dto.MenuItemSearchResultDTO;
import com.hufds.entity.MenuItem;
import com.hufds.entity.Restaurant;
import com.hufds.repository.MenuItemRepository;
import com.hufds.service.impl.MenuItemSearchServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MenuItemSearchServiceTest {

    @Mock
    private MenuItemRepository menuItemRepository;

    @InjectMocks
    private MenuItemSearchServiceImpl menuItemSearchService;

    private MenuItemSearchDTO searchDTO;
    private List<MenuItem> mockMenuItems;
    private MenuItem item1;
    private MenuItem item2;

    @BeforeEach
    void setUp() {
        searchDTO = new MenuItemSearchDTO();
        searchDTO.setRestaurantId(1); // Set default restaurantId
        
        // Create mock menu items
        item1 = new MenuItem();
        item1.setMenuItemId(1);
        item1.setName("Pizza Margherita");
        item1.setDescription("Classic pizza with tomato and mozzarella");
        item1.setPrice(new BigDecimal("12.99"));
        item1.setCategory("main");
        item1.setImageUrl("http://example.com/pizza.jpg");
        item1.setAvailability(true);
        
        Restaurant restaurant1 = new Restaurant();
        restaurant1.setRestaurantId(1);
        restaurant1.setName("Pizza Place");
        item1.setRestaurant(restaurant1);

        item2 = new MenuItem();
        item2.setMenuItemId(2);
        item2.setName("Caesar Salad");
        item2.setDescription("Fresh salad with Caesar dressing");
        item2.setPrice(new BigDecimal("8.99"));
        item2.setCategory("starter");
        item2.setImageUrl("http://example.com/salad.jpg");
        item2.setAvailability(true);
        
        Restaurant restaurant2 = new Restaurant();
        restaurant2.setRestaurantId(2);
        restaurant2.setName("Salad Bar");
        item2.setRestaurant(restaurant2);

        mockMenuItems = Arrays.asList(item1, item2);
    }

    @Test
    void searchMenuItems_ShouldReturnMatchingItems_WhenSearchingByName() {
        // Arrange
        searchDTO.setName("pizza");
        when(menuItemRepository.findByRestaurantRestaurantId(1)).thenReturn(Collections.singletonList(item1));
        when(menuItemRepository.findByRestaurantRestaurantIdAndNameContainingIgnoreCase(1, "pizza"))
            .thenReturn(Collections.singletonList(item1));

        // Act
        List<MenuItemSearchResultDTO> results = menuItemSearchService.searchMenuItems(searchDTO);

        // Assert
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Pizza Margherita", results.get(0).getName());
        verify(menuItemRepository).findByRestaurantRestaurantIdAndNameContainingIgnoreCase(1, "pizza");
    }

    @Test
    void searchMenuItems_ShouldReturnMatchingItems_WhenSearchingByCategory() {
        // Arrange
        searchDTO.setCategory("main");
        when(menuItemRepository.findByRestaurantRestaurantId(1)).thenReturn(Collections.singletonList(item1));
        when(menuItemRepository.findByRestaurantRestaurantIdAndCategoryContainingIgnoreCase(1, "main"))
            .thenReturn(Collections.singletonList(item1));

        // Act
        List<MenuItemSearchResultDTO> results = menuItemSearchService.searchMenuItems(searchDTO);

        // Assert
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("main", results.get(0).getCategory());
        verify(menuItemRepository).findByRestaurantRestaurantIdAndCategoryContainingIgnoreCase(1, "main");
    }

    @Test
    void searchMenuItems_ShouldReturnMatchingItems_WhenSearchingByPriceRange() {
        // Arrange
        searchDTO.setMinPrice(new BigDecimal("10.00"));
        searchDTO.setMaxPrice(new BigDecimal("15.00"));
        when(menuItemRepository.findByRestaurantRestaurantId(1)).thenReturn(Collections.singletonList(item1));
        when(menuItemRepository.findByRestaurantRestaurantIdAndPriceBetween(1, 
            new BigDecimal("10.00"), new BigDecimal("15.00")))
            .thenReturn(Collections.singletonList(item1));

        // Act
        List<MenuItemSearchResultDTO> results = menuItemSearchService.searchMenuItems(searchDTO);

        // Assert
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(new BigDecimal("12.99"), results.get(0).getPrice());
        verify(menuItemRepository).findByRestaurantRestaurantIdAndPriceBetween(1, 
            new BigDecimal("10.00"), new BigDecimal("15.00"));
    }

    @Test
    void searchMenuItems_ShouldReturnMatchingItems_WhenSearchingByAvailability() {
        // Arrange
        searchDTO.setIsAvailable(true);
        when(menuItemRepository.findByRestaurantRestaurantId(1)).thenReturn(Collections.singletonList(item1));
        when(menuItemRepository.findByRestaurantRestaurantIdAndAvailability(1, true))
            .thenReturn(Collections.singletonList(item1));

        // Act
        List<MenuItemSearchResultDTO> results = menuItemSearchService.searchMenuItems(searchDTO);

        // Assert
        assertNotNull(results);
        assertEquals(1, results.size());
        assertTrue(results.get(0).getIsAvailable());
        verify(menuItemRepository).findByRestaurantRestaurantIdAndAvailability(1, true);
    }

    @Test
    void searchMenuItems_ShouldReturnAllItems_WhenNoSearchCriteriaProvided() {
        // Arrange
        searchDTO = new MenuItemSearchDTO(); // Reset to test no criteria
        when(menuItemRepository.findAll()).thenReturn(mockMenuItems);

        // Act
        List<MenuItemSearchResultDTO> results = menuItemSearchService.searchMenuItems(searchDTO);

        // Assert
        assertNotNull(results);
        assertEquals(2, results.size());
        verify(menuItemRepository).findAll();
    }

    @Test
    void searchMenuItems_ShouldReturnEmptyList_WhenNoMatchesFound() {
        // Arrange
        searchDTO.setName("nonexistent");
        when(menuItemRepository.findByRestaurantRestaurantId(1)).thenReturn(Collections.singletonList(item1));
        when(menuItemRepository.findByRestaurantRestaurantIdAndNameContainingIgnoreCase(1, "nonexistent"))
            .thenReturn(Collections.emptyList());

        // Act
        List<MenuItemSearchResultDTO> results = menuItemSearchService.searchMenuItems(searchDTO);

        // Assert
        assertNotNull(results);
        assertTrue(results.isEmpty());
        verify(menuItemRepository).findByRestaurantRestaurantIdAndNameContainingIgnoreCase(1, "nonexistent");
    }

    @Test
    void searchMenuItems_ShouldCombineMultipleSearchCriteria() {
        // Arrange
        searchDTO.setName("pizza");
        searchDTO.setCategory("main");
        searchDTO.setMinPrice(new BigDecimal("10.00"));
        searchDTO.setMaxPrice(new BigDecimal("15.00"));
        searchDTO.setIsAvailable(true);
        
        when(menuItemRepository.findByRestaurantRestaurantId(1)).thenReturn(Collections.singletonList(item1));
        when(menuItemRepository.findByRestaurantRestaurantIdAndNameContainingIgnoreCase(1, "pizza"))
            .thenReturn(Collections.singletonList(item1));
        when(menuItemRepository.findByRestaurantRestaurantIdAndCategoryContainingIgnoreCase(1, "main"))
            .thenReturn(Collections.singletonList(item1));
        when(menuItemRepository.findByRestaurantRestaurantIdAndPriceBetween(1, 
            new BigDecimal("10.00"), new BigDecimal("15.00")))
            .thenReturn(Collections.singletonList(item1));
        when(menuItemRepository.findByRestaurantRestaurantIdAndAvailability(1, true))
            .thenReturn(Collections.singletonList(item1));

        // Act
        List<MenuItemSearchResultDTO> results = menuItemSearchService.searchMenuItems(searchDTO);

        // Assert
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Pizza Margherita", results.get(0).getName());
        assertEquals("main", results.get(0).getCategory());
        assertEquals(new BigDecimal("12.99"), results.get(0).getPrice());
        assertTrue(results.get(0).getIsAvailable());
        
        verify(menuItemRepository).findByRestaurantRestaurantIdAndNameContainingIgnoreCase(1, "pizza");
        verify(menuItemRepository).findByRestaurantRestaurantIdAndCategoryContainingIgnoreCase(1, "main");
        verify(menuItemRepository).findByRestaurantRestaurantIdAndPriceBetween(1, 
            new BigDecimal("10.00"), new BigDecimal("15.00"));
        verify(menuItemRepository).findByRestaurantRestaurantIdAndAvailability(1, true);
    }
} 