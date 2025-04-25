package com.hufds.service.impl;

import com.hufds.dto.RestaurantSearchDTO;
import com.hufds.dto.RestaurantSearchResultDTO;
import com.hufds.entity.Restaurant;
import com.hufds.repository.RestaurantRepository;
import com.hufds.service.RestaurantConfigService;
import com.hufds.service.RestaurantSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantSearchServiceImpl implements RestaurantSearchService {

    private final RestaurantRepository restaurantRepository;
    private final RestaurantConfigService restaurantConfigService;

    @Override
    public List<RestaurantSearchResultDTO> searchRestaurants(RestaurantSearchDTO searchDTO) {
        List<Restaurant> restaurants = new ArrayList<>();

        // If all search parameters are null, return all restaurants
        if (isAllSearchParametersNull(searchDTO)) {
            restaurants.addAll(restaurantRepository.findAll());
        } else {
            // Basic search by name, cuisine, location
            if (searchDTO.getName() != null) {
                restaurants.addAll(restaurantRepository.findByNameContainingIgnoreCase(searchDTO.getName()));
            }
            if (searchDTO.getCuisineType() != null) {
                restaurants.addAll(restaurantRepository.findByCuisineTypeContainingIgnoreCase(searchDTO.getCuisineType()));
            }
            if (searchDTO.getCity() != null) {
                restaurants.addAll(restaurantRepository.findByCityContainingIgnoreCase(searchDTO.getCity()));
            }
            if (searchDTO.getState() != null) {
                restaurants.addAll(restaurantRepository.findByStateContainingIgnoreCase(searchDTO.getState()));
            }
            if (searchDTO.getCountry() != null) {
                restaurants.addAll(restaurantRepository.findByCountryContainingIgnoreCase(searchDTO.getCountry()));
            }

            // Location-based search
            if (searchDTO.getLatitude() != null && searchDTO.getLongitude() != null && searchDTO.getMaxDistanceKm() != null) {
                restaurants.addAll(restaurantRepository.findByLocationWithinDistance(
                    BigDecimal.valueOf(searchDTO.getLatitude()),
                    BigDecimal.valueOf(searchDTO.getLongitude()),
                    searchDTO.getMaxDistanceKm()
                ));
            }
        }

        // Remove duplicates and filter by additional criteria
        return restaurants.stream()
            .distinct()
            .filter(restaurant -> filterByPriceRange(restaurant, searchDTO.getMinPrice(), searchDTO.getMaxPrice()))
            .filter(restaurant -> filterByDeliveryTime(restaurant, searchDTO.getDeliveryTime()))
            .map(this::mapToSearchResultDTO)
            .collect(Collectors.toList());
    }

    private boolean isAllSearchParametersNull(RestaurantSearchDTO searchDTO) {
        return searchDTO.getName() == null &&
               searchDTO.getCuisineType() == null &&
               searchDTO.getCity() == null &&
               searchDTO.getState() == null &&
               searchDTO.getCountry() == null &&
               searchDTO.getLatitude() == null &&
               searchDTO.getLongitude() == null &&
               searchDTO.getMaxDistanceKm() == null;
    }

    private boolean filterByPriceRange(Restaurant restaurant, Double minPrice, Double maxPrice) {
        if (minPrice == null && maxPrice == null) {
            return true;
        }

        // Calculate average price from menu items
        double averagePrice = restaurant.getMenuItems().stream()
            .mapToDouble(item -> item.getPrice().doubleValue())
            .average()
            .orElse(0.0);

        return (minPrice == null || averagePrice >= minPrice) &&
               (maxPrice == null || averagePrice <= maxPrice);
    }

    private boolean filterByDeliveryTime(Restaurant restaurant, String deliveryTime) {
        if (deliveryTime == null) {
            return true;
        }

        // Check if restaurant is open at the requested delivery time
        return restaurantConfigService.isRestaurantOpen(restaurant.getRestaurantId());
    }

    private RestaurantSearchResultDTO mapToSearchResultDTO(Restaurant restaurant) {
        return RestaurantSearchResultDTO.builder()
            .restaurantId(restaurant.getRestaurantId())
            .name(restaurant.getName())
            .cuisineType(restaurant.getCuisineType())
            .phoneNumber(restaurant.getPhoneNumber())
            .rating(restaurant.getRating())
            .street(restaurant.getStreet())
            .city(restaurant.getCity())
            .state(restaurant.getState())
            .zipCode(restaurant.getZipCode())
            .country(restaurant.getCountry())
            .latitude(restaurant.getLatitude())
            .longitude(restaurant.getLongitude())
            .deliveryRangeKm(restaurant.getDeliveryRangeKm())
            .estimatedDeliveryTime(calculateEstimatedDeliveryTime(restaurant))
            .averagePrice(calculateAveragePrice(restaurant))
            .isOpen(restaurantConfigService.isRestaurantOpen(restaurant.getRestaurantId()))
            .build();
    }

    private LocalTime calculateEstimatedDeliveryTime(Restaurant restaurant) {
        // Simple calculation: current time + 30 minutes
        return LocalTime.now().plusMinutes(30);
    }

    private Double calculateAveragePrice(Restaurant restaurant) {
        return restaurant.getMenuItems().stream()
            .mapToDouble(item -> item.getPrice().doubleValue())
            .average()
            .orElse(0.0);
    }
} 