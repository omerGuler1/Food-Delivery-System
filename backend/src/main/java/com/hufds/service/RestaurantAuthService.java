package com.hufds.service;

import com.hufds.dto.RestaurantLoginDTO;
import com.hufds.dto.RestaurantRegisterDTO;
import com.hufds.dto.RestaurantResponseDTO;

public interface RestaurantAuthService {
    RestaurantResponseDTO register(RestaurantRegisterDTO registerDTO);
    RestaurantResponseDTO login(RestaurantLoginDTO loginDTO);
}
