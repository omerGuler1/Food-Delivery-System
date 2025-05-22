package com.hufds.service.impl;

import com.hufds.dto.RestaurantProfileDTO;
import com.hufds.entity.Restaurant;
import com.hufds.exception.CustomException;
import com.hufds.repository.RestaurantRepository;
import com.hufds.service.RestaurantProfileService;
import com.hufds.service.GeocodingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RestaurantProfileServiceImpl implements RestaurantProfileService {

    private final RestaurantRepository restaurantRepository;
    private final GeocodingService geocodingService;

    @Override
    public RestaurantProfileDTO getProfile(Integer restaurantId) {
        Restaurant restaurant = getRestaurantById(restaurantId);
        return mapToDTO(restaurant);
    }

    @Override
    @Transactional
    public RestaurantProfileDTO updateProfile(Integer restaurantId, RestaurantProfileDTO profileDTO) {
        Restaurant restaurant = getRestaurantById(restaurantId);
        
        // Update basic profile information
        restaurant.setName(profileDTO.getName());
        restaurant.setPhoneNumber(profileDTO.getPhoneNumber());
        restaurant.setCuisineType(profileDTO.getCuisineType());
        
        // Update address if provided
        if (profileDTO.getAddress() != null) {
            updateAddress(restaurant, profileDTO.getAddress());
        }
        
        // Update location if provided
        if (profileDTO.getLocation() != null) {
            updateLocation(restaurant, profileDTO.getLocation());
        }
        
        // Update delivery range if provided
        if (profileDTO.getDeliveryRangeKm() != null) {
            restaurant.setDeliveryRangeKm(profileDTO.getDeliveryRangeKm());
        }
        
        Restaurant updated = restaurantRepository.save(restaurant);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void updateAddress(Integer restaurantId, RestaurantProfileDTO.AddressDTO addressDTO) {
        Restaurant restaurant = getRestaurantById(restaurantId);
        updateAddress(restaurant, addressDTO);
        restaurantRepository.save(restaurant);
    }

    @Override
    @Transactional
    public void updateLocation(Integer restaurantId, RestaurantProfileDTO.LocationDTO locationDTO) {
        Restaurant restaurant = getRestaurantById(restaurantId);
        updateLocation(restaurant, locationDTO);
        restaurantRepository.save(restaurant);
    }

    private Restaurant getRestaurantById(Integer restaurantId) {
        return restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new CustomException("Restaurant not found", HttpStatus.NOT_FOUND));
    }

    private void updateAddress(Restaurant restaurant, RestaurantProfileDTO.AddressDTO addressDTO) {
        restaurant.setStreet(addressDTO.getStreet());
        restaurant.setCity(addressDTO.getCity());
        restaurant.setState(addressDTO.getState());
        restaurant.setZipCode(addressDTO.getZipCode());
        restaurant.setCountry(addressDTO.getCountry());
        
        // Generate coordinates based on the address
        GeocodingService.Coordinates coordinates = geocodingService.geocodeAddress(
                addressDTO.getStreet(),
                addressDTO.getCity(),
                addressDTO.getState(),
                addressDTO.getZipCode(),
                addressDTO.getCountry()
        );
        
        // Update restaurant coordinates
        restaurant.setLatitude(coordinates.getLatitude());
        restaurant.setLongitude(coordinates.getLongitude());
    }

    private void updateLocation(Restaurant restaurant, RestaurantProfileDTO.LocationDTO locationDTO) {
        restaurant.setLatitude(locationDTO.getLatitude());
        restaurant.setLongitude(locationDTO.getLongitude());
    }

    private RestaurantProfileDTO mapToDTO(Restaurant restaurant) {
        RestaurantProfileDTO.AddressDTO addressDTO = null;
        if (restaurant.getStreet() != null) {
            addressDTO = RestaurantProfileDTO.AddressDTO.builder()
                    .street(restaurant.getStreet())
                    .city(restaurant.getCity())
                    .state(restaurant.getState())
                    .zipCode(restaurant.getZipCode())
                    .country(restaurant.getCountry())
                    .build();
        }

        RestaurantProfileDTO.LocationDTO locationDTO = null;
        if (restaurant.getLatitude() != null) {
            locationDTO = RestaurantProfileDTO.LocationDTO.builder()
                    .latitude(restaurant.getLatitude())
                    .longitude(restaurant.getLongitude())
                    .build();
        }

        return RestaurantProfileDTO.builder()
                .name(restaurant.getName())
                .email(restaurant.getEmail())
                .phoneNumber(restaurant.getPhoneNumber())
                .cuisineType(restaurant.getCuisineType())
                .address(addressDTO)
                .location(locationDTO)
                .deliveryRangeKm(restaurant.getDeliveryRangeKm())
                .profileImageUrl(restaurant.getProfileImageUrl())
                .build();
    }
} 