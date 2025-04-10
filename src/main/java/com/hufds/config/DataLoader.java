package com.hufds.config;

import com.hufds.entity.*;
import com.hufds.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.HashSet;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(
            RestaurantRepository restaurantRepository,
            BusinessHoursRepository businessHoursRepository,
            MenuItemRepository menuItemRepository) {
        return args -> {
            // Check if data already exists
            if (restaurantRepository.count() > 0) {
                System.out.println("Database already initialized, skipping data loading.");
                return;
            }

            // Create test restaurants
            Restaurant restaurant1 = new Restaurant();
            restaurant1.setName("Pizza Palace");
            restaurant1.setEmail("pizza@example.com");
            restaurant1.setPassword("password123");
            restaurant1.setPhoneNumber("123-456-7890");
            restaurant1.setCuisineType("Italian");
            restaurant1.setDeliveryRangeKm(5);
            restaurant1.setRating(4.5f);
            restaurant1.setBusinessHours(new HashSet<>());
            restaurant1.setMenuItems(new HashSet<>());
            restaurant1 = restaurantRepository.save(restaurant1);

            Restaurant restaurant2 = new Restaurant();
            restaurant2.setName("Sushi Express");
            restaurant2.setEmail("sushi@example.com");
            restaurant2.setPassword("password123");
            restaurant2.setPhoneNumber("123-456-7891");
            restaurant2.setCuisineType("Japanese");
            restaurant2.setDeliveryRangeKm(3);
            restaurant2.setRating(4.8f);
            restaurant2.setBusinessHours(new HashSet<>());
            restaurant2.setMenuItems(new HashSet<>());
            restaurant2 = restaurantRepository.save(restaurant2);

            // Add business hours for restaurant1
            BusinessHours mondayHours = new BusinessHours();
            mondayHours.setRestaurant(restaurant1);
            mondayHours.setDayOfWeek(BusinessHours.DayOfWeek.MONDAY);
            mondayHours.setOpenTime(LocalTime.of(10, 0));
            mondayHours.setCloseTime(LocalTime.of(22, 0));
            mondayHours.setIsClosed(false);
            businessHoursRepository.save(mondayHours);

            // Add menu items for restaurant1
            MenuItem pizza = new MenuItem();
            pizza.setRestaurant(restaurant1);
            pizza.setName("Margherita Pizza");
            pizza.setDescription("Classic Italian pizza with tomato sauce and mozzarella");
            pizza.setPrice(new BigDecimal("12.99"));
            pizza.setAvailability(true);
            menuItemRepository.save(pizza);

            System.out.println("Sample data has been loaded.");
        };
    }
} 