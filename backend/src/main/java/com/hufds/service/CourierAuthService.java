package com.hufds.service;

import com.hufds.dto.CourierLoginDTO;
import com.hufds.dto.CourierRegisterDTO;
import com.hufds.dto.CourierResponseDTO;

public interface CourierAuthService {
    CourierResponseDTO register(CourierRegisterDTO registerDTO);
    CourierResponseDTO login(CourierLoginDTO loginDTO);
}