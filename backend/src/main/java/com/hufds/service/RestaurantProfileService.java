package com.hufds.service;

import com.hufds.dto.RestaurantProfileDTO;
import com.hufds.entity.Restaurant;
import org.springframework.web.multipart.MultipartFile;

public interface RestaurantProfileService {
    RestaurantProfileDTO getProfile(Integer restaurantId);
    RestaurantProfileDTO updateProfile(Integer restaurantId, RestaurantProfileDTO profileDTO);
    void updateAddress(Integer restaurantId, RestaurantProfileDTO.AddressDTO addressDTO);
    void updateLocation(Integer restaurantId, RestaurantProfileDTO.LocationDTO locationDTO);
    String uploadProfileImage(Integer restaurantId, MultipartFile image);
} 