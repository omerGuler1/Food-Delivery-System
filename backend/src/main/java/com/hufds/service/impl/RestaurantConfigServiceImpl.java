package com.hufds.service.impl;

import com.hufds.dto.BusinessHoursDTO;
import com.hufds.dto.RestaurantConfigDTO;
import com.hufds.entity.BusinessHours;
import com.hufds.entity.Restaurant;
import com.hufds.exception.CustomException;
import com.hufds.repository.BusinessHoursRepository;
import com.hufds.repository.RestaurantRepository;
import com.hufds.service.RestaurantConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantConfigServiceImpl implements RestaurantConfigService {

    private final BusinessHoursRepository businessHoursRepository;
    private final RestaurantRepository restaurantRepository;

    @Override
    @Transactional
    public BusinessHours addBusinessHours(Integer restaurantId, BusinessHoursDTO businessHoursDTO) {
        Restaurant restaurant = getRestaurantById(restaurantId);
        
        BusinessHours businessHours = new BusinessHours();
        updateBusinessHoursFromDTO(businessHours, businessHoursDTO);
        businessHours.setRestaurant(restaurant);
        
        return businessHoursRepository.save(businessHours);
    }

    @Override
    @Transactional
    public BusinessHours updateBusinessHours(Integer hoursId, BusinessHoursDTO businessHoursDTO, Integer restaurantId) {
        BusinessHours businessHours = getBusinessHoursAndValidateRestaurant(hoursId, restaurantId);
        updateBusinessHoursFromDTO(businessHours, businessHoursDTO);
        return businessHoursRepository.save(businessHours);
    }

    @Override
    @Transactional
    public void deleteBusinessHours(Integer hoursId, Integer restaurantId) {
        BusinessHours businessHours = getBusinessHoursAndValidateRestaurant(hoursId, restaurantId);
        businessHoursRepository.delete(businessHours);
    }

    @Override
    public List<BusinessHours> getBusinessHours(Integer restaurantId) {
        return businessHoursRepository.findByRestaurantRestaurantId(restaurantId);
    }

    @Override
    public BusinessHours getBusinessHoursById(Integer hoursId, Integer restaurantId) {
        return getBusinessHoursAndValidateRestaurant(hoursId, restaurantId);
    }

    @Override
    @Transactional
    public Restaurant updateDeliveryRange(Integer restaurantId, RestaurantConfigDTO configDTO) {
        Restaurant restaurant = getRestaurantById(restaurantId);
        restaurant.setDeliveryRangeKm(configDTO.getDeliveryRangeKm());
        return restaurantRepository.save(restaurant);
    }

    @Override
    public Integer getDeliveryRange(Integer restaurantId) {
        Restaurant restaurant = getRestaurantById(restaurantId);
        return restaurant.getDeliveryRangeKm();
    }

    @Override
    public boolean isRestaurantOpen(Integer restaurantId) {
        DayOfWeek currentDay = DayOfWeek.from(java.time.LocalDate.now());
        LocalTime currentTime = LocalTime.now();
        
        List<BusinessHours> businessHours = businessHoursRepository.findByRestaurantRestaurantId(restaurantId);
        
        return businessHours.stream()
                .filter(hours -> hours.getDayOfWeek().equalsIgnoreCase(currentDay.name()))
                .anyMatch(hours -> {
                    if (hours.getIsClosed()) {
                        return false;
                    }
                    return !currentTime.isBefore(hours.getOpenTime()) && 
                           !currentTime.isAfter(hours.getCloseTime());
                });
    }

    private Restaurant getRestaurantById(Integer restaurantId) {
        return restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new CustomException("Restaurant not found", HttpStatus.NOT_FOUND));
    }

    private BusinessHours getBusinessHoursAndValidateRestaurant(Integer hoursId, Integer restaurantId) {
        BusinessHours businessHours = businessHoursRepository.findById(hoursId)
                .orElseThrow(() -> new CustomException("Business hours not found", HttpStatus.NOT_FOUND));

        if (!businessHours.getRestaurant().getRestaurantId().equals(restaurantId)) {
            throw new CustomException("Business hours do not belong to this restaurant", HttpStatus.FORBIDDEN);
        }

        return businessHours;
    }

    private void updateBusinessHoursFromDTO(BusinessHours businessHours, BusinessHoursDTO dto) {
        businessHours.setDayOfWeek(dto.getDayOfWeek());
        businessHours.setOpenTime(dto.getOpenTime());
        businessHours.setCloseTime(dto.getCloseTime());
        businessHours.setIsClosed(dto.getIsClosed());
    }
} 