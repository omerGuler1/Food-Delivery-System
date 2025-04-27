package com.hufds.service;

import com.hufds.dto.CourierAvailabilityDTO;
import com.hufds.entity.Courier;

import java.util.List;

public interface CourierAvailabilityService {
    Courier updateAvailability(Integer courierId, CourierAvailabilityDTO availabilityDTO);
    List<Courier> getAvailableCouriers();
    Courier getCourierById(Integer courierId);
} 