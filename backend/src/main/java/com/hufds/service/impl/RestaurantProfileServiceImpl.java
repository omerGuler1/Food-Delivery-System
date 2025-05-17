package com.hufds.service.impl;

import com.hufds.dto.RestaurantProfileDTO;
import com.hufds.entity.Restaurant;
import com.hufds.exception.CustomException;
import com.hufds.repository.RestaurantRepository;
import com.hufds.service.RestaurantProfileService;
import com.hufds.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class RestaurantProfileServiceImpl implements RestaurantProfileService {

    private final RestaurantRepository restaurantRepository;
    private final FileStorageService fileStorageService;

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

    @Override
    @Transactional
    public String uploadProfileImage(Integer restaurantId, MultipartFile image) {
        Restaurant restaurant = getRestaurantById(restaurantId);
        if (image.isEmpty()) {
            throw new CustomException("Please select an image to upload", HttpStatus.BAD_REQUEST);
        }
        String contentType = image.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new CustomException("Only image files are allowed", HttpStatus.BAD_REQUEST);
        }
        if (image.getSize() > 5 * 1024 * 1024) {
            throw new CustomException("Image size must be less than 5MB", HttpStatus.BAD_REQUEST);
        }
        String imageUrl = fileStorageService.storeFile(image, "restaurant-profiles");
        restaurant.setProfileImageUrl(imageUrl);
        restaurantRepository.save(restaurant);
        return imageUrl;
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
                .profileImageUrl(restaurant.getProfileImageUrl())
                .build();
    }
} 