package com.hufds.service;

import com.hufds.dto.RestaurantSearchDTO;
import com.hufds.dto.RestaurantSearchResultDTO;

import java.util.List;

public interface RestaurantSearchService {
    List<RestaurantSearchResultDTO> searchRestaurants(RestaurantSearchDTO searchDTO);
} 