package com.hufds.service;

import com.hufds.dto.RestaurantSearchDTO;
import com.hufds.dto.RestaurantSearchResultDTO;
import com.hufds.entity.Restaurant;
import com.hufds.entity.MenuItem;
import com.hufds.repository.RestaurantRepository;
import com.hufds.service.impl.RestaurantSearchServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RestaurantSearchServiceTest {

    @Mock
    private RestaurantRepository restaurantRepository;

    @Mock
    private RestaurantConfigService restaurantConfigService;

    @InjectMocks
    private RestaurantSearchServiceImpl restaurantSearchService;

    private Restaurant italianRestaurant;
    private Restaurant chineseRestaurant;
    private RestaurantSearchDTO searchDTO;

    @BeforeEach
    void setUp() {
        // Setup Italian restaurant
        italianRestaurant = new Restaurant();
        italianRestaurant.setRestaurantId(1);
        italianRestaurant.setName("Mama Mia Italian");
        italianRestaurant.setCuisineType("Italian");
        italianRestaurant.setCity("New York");
        italianRestaurant.setState("NY");
        italianRestaurant.setCountry("USA");
        italianRestaurant.setLatitude(new BigDecimal("40.7128"));
        italianRestaurant.setLongitude(new BigDecimal("-74.0060"));
        italianRestaurant.setDeliveryRangeKm(5);

        // Setup menu items for Italian restaurant
        Set<MenuItem> italianMenuItems = new HashSet<>();
        MenuItem pasta = new MenuItem();
        pasta.setPrice(new BigDecimal("15.99"));
        MenuItem pizza = new MenuItem();
        pizza.setPrice(new BigDecimal("12.99"));
        italianMenuItems.add(pasta);
        italianMenuItems.add(pizza);
        italianRestaurant.setMenuItems(italianMenuItems);

        // Setup Chinese restaurant
        chineseRestaurant = new Restaurant();
        chineseRestaurant.setRestaurantId(2);
        chineseRestaurant.setName("Dragon Palace");
        chineseRestaurant.setCuisineType("Chinese");
        chineseRestaurant.setCity("New York");
        chineseRestaurant.setState("NY");
        chineseRestaurant.setCountry("USA");
        chineseRestaurant.setLatitude(new BigDecimal("40.7128"));
        chineseRestaurant.setLongitude(new BigDecimal("-74.0060"));
        chineseRestaurant.setDeliveryRangeKm(3);

        // Setup menu items for Chinese restaurant
        Set<MenuItem> chineseMenuItems = new HashSet<>();
        MenuItem noodles = new MenuItem();
        noodles.setPrice(new BigDecimal("10.99"));
        MenuItem dumplings = new MenuItem();
        dumplings.setPrice(new BigDecimal("8.99"));
        chineseMenuItems.add(noodles);
        chineseMenuItems.add(dumplings);
        chineseRestaurant.setMenuItems(chineseMenuItems);

        // Setup search DTO
        searchDTO = RestaurantSearchDTO.builder()
            .name("Mama")
            .cuisineType("Italian")
            .city("New York")
            .state("NY")
            .country("USA")
            .minPrice(10.0)
            .maxPrice(50.0)
            .latitude(40.7128)
            .longitude(-74.0060)
            .maxDistanceKm(5)
            .build();
    }

    @Test
    void searchRestaurants_ShouldReturnMatchingRestaurants_WhenSearchingByName() {
        // Arrange
        when(restaurantRepository.findByNameContainingIgnoreCase("Mama"))
            .thenReturn(List.of(italianRestaurant));
        when(restaurantConfigService.isRestaurantOpen(any()))
            .thenReturn(true);

        // Act
        List<RestaurantSearchResultDTO> results = restaurantSearchService.searchRestaurants(searchDTO);

        // Assert
        assertEquals(1, results.size());
        assertEquals("Mama Mia Italian", results.get(0).getName());
        assertEquals("Italian", results.get(0).getCuisineType());
    }

    @Test
    void searchRestaurants_ShouldReturnMatchingRestaurants_WhenSearchingByCuisine() {
        // Arrange
        when(restaurantRepository.findByCuisineTypeContainingIgnoreCase("Italian"))
            .thenReturn(List.of(italianRestaurant));
        when(restaurantConfigService.isRestaurantOpen(any()))
            .thenReturn(true);

        // Act
        List<RestaurantSearchResultDTO> results = restaurantSearchService.searchRestaurants(searchDTO);

        // Assert
        assertEquals(1, results.size());
        assertEquals("Italian", results.get(0).getCuisineType());
    }

    @Test
    void searchRestaurants_ShouldReturnMatchingRestaurants_WhenSearchingByLocation() {
        // Arrange
        RestaurantSearchDTO locationSearchDTO = RestaurantSearchDTO.builder()
            .latitude(40.7128)
            .longitude(-74.0060)
            .maxDistanceKm(5)
            .build();

        when(restaurantRepository.findByLocationWithinDistance(
            any(BigDecimal.class),
            any(BigDecimal.class),
            anyDouble()))
            .thenReturn(List.of(italianRestaurant, chineseRestaurant));
        when(restaurantConfigService.isRestaurantOpen(any()))
            .thenReturn(true);

        // Act
        List<RestaurantSearchResultDTO> results = restaurantSearchService.searchRestaurants(locationSearchDTO);

        // Assert
        assertEquals(2, results.size());
        assertTrue(results.stream().anyMatch(r -> r.getName().equals("Mama Mia Italian")));
        assertTrue(results.stream().anyMatch(r -> r.getName().equals("Dragon Palace")));
    }

    @Test
    void searchRestaurants_ShouldFilterByPriceRange() {
        // Arrange
        when(restaurantRepository.findByNameContainingIgnoreCase("Mama"))
            .thenReturn(List.of(italianRestaurant));
        when(restaurantConfigService.isRestaurantOpen(any()))
            .thenReturn(true);

        // Act
        List<RestaurantSearchResultDTO> results = restaurantSearchService.searchRestaurants(searchDTO);

        // Assert
        assertEquals(1, results.size());
        assertTrue(results.get(0).getAveragePrice() >= 10.0);
        assertTrue(results.get(0).getAveragePrice() <= 50.0);
    }

    @Test
    void searchRestaurants_ShouldFilterByDeliveryTime() {
        // Arrange
        when(restaurantRepository.findByNameContainingIgnoreCase("Mama"))
            .thenReturn(List.of(italianRestaurant));
        when(restaurantConfigService.isRestaurantOpen(1))
            .thenReturn(true);

        // Act
        List<RestaurantSearchResultDTO> results = restaurantSearchService.searchRestaurants(searchDTO);

        // Assert
        assertEquals(1, results.size());
        assertTrue(results.get(0).isOpen());
    }

    @Test
    void searchRestaurants_ShouldReturnEmptyList_WhenNoMatchesFound() {
        // Arrange
        when(restaurantRepository.findByNameContainingIgnoreCase("Mama"))
            .thenReturn(List.of());
        when(restaurantRepository.findByCuisineTypeContainingIgnoreCase("Italian"))
            .thenReturn(List.of());
        when(restaurantRepository.findByLocationWithinDistance(
            any(BigDecimal.class),
            any(BigDecimal.class),
            anyDouble()))
            .thenReturn(List.of());

        // Act
        List<RestaurantSearchResultDTO> results = restaurantSearchService.searchRestaurants(searchDTO);

        // Assert
        assertTrue(results.isEmpty());
    }

    @Test
    void searchRestaurants_ShouldHandleNullSearchParameters() {
        // Arrange
        RestaurantSearchDTO nullSearchDTO = new RestaurantSearchDTO();
        when(restaurantRepository.findAll())
            .thenReturn(List.of(italianRestaurant, chineseRestaurant));
        when(restaurantConfigService.isRestaurantOpen(any()))
            .thenReturn(true);

        // Act
        List<RestaurantSearchResultDTO> results = restaurantSearchService.searchRestaurants(nullSearchDTO);

        // Assert
        assertEquals(2, results.size());
    }
} 