package com.hufds.service.impl;

import com.hufds.dto.BusinessHoursDTO;
import com.hufds.dto.RestaurantConfigDTO;
import com.hufds.entity.BusinessHours;
import com.hufds.entity.Restaurant;
import com.hufds.exception.CustomException;
import com.hufds.repository.BusinessHoursRepository;
import com.hufds.repository.RestaurantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RestaurantConfigServiceImplTest {

    @Mock
    private BusinessHoursRepository businessHoursRepository;

    @Mock
    private RestaurantRepository restaurantRepository;

    @InjectMocks
    private RestaurantConfigServiceImpl restaurantConfigService;

    private Restaurant testRestaurant;
    private BusinessHours testBusinessHours;
    private BusinessHoursDTO testBusinessHoursDTO;
    private RestaurantConfigDTO testConfigDTO;

    @BeforeEach
    void setUp() {
        testRestaurant = new Restaurant();
        testRestaurant.setRestaurantId(1);
        testRestaurant.setDeliveryRangeKm(5);

        testBusinessHours = new BusinessHours();
        testBusinessHours.setHoursId(1);
        testBusinessHours.setDayOfWeek("MONDAY");
        testBusinessHours.setOpenTime(LocalTime.of(9, 0));
        testBusinessHours.setCloseTime(LocalTime.of(17, 0));
        testBusinessHours.setIsClosed(false);
        testBusinessHours.setRestaurant(testRestaurant);

        testBusinessHoursDTO = BusinessHoursDTO.builder()
                .dayOfWeek("MONDAY")
                .openTime(LocalTime.of(9, 0))
                .closeTime(LocalTime.of(17, 0))
                .isClosed(false)
                .build();

        testConfigDTO = RestaurantConfigDTO.builder()
                .deliveryRangeKm(10)
                .build();
    }

    @Test
    void addBusinessHours_Success() {
        when(restaurantRepository.findById(1)).thenReturn(Optional.of(testRestaurant));
        when(businessHoursRepository.save(any(BusinessHours.class))).thenReturn(testBusinessHours);

        BusinessHours result = restaurantConfigService.addBusinessHours(1, testBusinessHoursDTO);

        assertNotNull(result);
        assertEquals("MONDAY", result.getDayOfWeek());
        assertEquals(LocalTime.of(9, 0), result.getOpenTime());
        assertEquals(LocalTime.of(17, 0), result.getCloseTime());
        assertFalse(result.getIsClosed());
    }

    @Test
    void updateBusinessHours_Success() {
        when(businessHoursRepository.findById(1)).thenReturn(Optional.of(testBusinessHours));
        when(businessHoursRepository.save(any(BusinessHours.class))).thenReturn(testBusinessHours);

        BusinessHours result = restaurantConfigService.updateBusinessHours(1, testBusinessHoursDTO, 1);

        assertNotNull(result);
        assertEquals("MONDAY", result.getDayOfWeek());
    }

    @Test
    void updateBusinessHours_NotFound() {
        when(businessHoursRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(CustomException.class, () -> 
            restaurantConfigService.updateBusinessHours(1, testBusinessHoursDTO, 1));
    }

    @Test
    void getBusinessHours_Success() {
        List<BusinessHours> businessHoursList = Arrays.asList(testBusinessHours);
        when(businessHoursRepository.findByRestaurantRestaurantId(1)).thenReturn(businessHoursList);

        List<BusinessHours> result = restaurantConfigService.getBusinessHours(1);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("MONDAY", result.get(0).getDayOfWeek());
    }

    @Test
    void updateDeliveryRange_Success() {
        when(restaurantRepository.findById(1)).thenReturn(Optional.of(testRestaurant));
        when(restaurantRepository.save(any(Restaurant.class))).thenReturn(testRestaurant);

        Restaurant result = restaurantConfigService.updateDeliveryRange(1, testConfigDTO);

        assertNotNull(result);
        assertEquals(10, result.getDeliveryRangeKm());
    }

    @Test
    void getDeliveryRange_Success() {
        when(restaurantRepository.findById(1)).thenReturn(Optional.of(testRestaurant));

        Integer result = restaurantConfigService.getDeliveryRange(1);

        assertEquals(5, result);
    }

    @Test
    void deleteBusinessHours_Success() {
        when(businessHoursRepository.findById(1)).thenReturn(Optional.of(testBusinessHours));
        doNothing().when(businessHoursRepository).delete(any(BusinessHours.class));

        assertDoesNotThrow(() -> restaurantConfigService.deleteBusinessHours(1, 1));
        verify(businessHoursRepository, times(1)).delete(any(BusinessHours.class));
    }
} 