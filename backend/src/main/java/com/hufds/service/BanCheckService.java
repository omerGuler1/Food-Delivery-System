package com.hufds.service;

import com.hufds.entity.Courier;
import com.hufds.entity.Customer;
import com.hufds.entity.Restaurant;
import com.hufds.repository.CourierRepository;
import com.hufds.repository.CustomerRepository;
import com.hufds.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for automatically checking and removing expired bans
 */
@Service
public class BanCheckService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private CourierRepository courierRepository;

    /**
     * Scheduled task that runs every 5 seconds to check for expired bans
     * and removes them automatically. This frequent checking is especially useful
     * for short ban durations (e.g., 10 seconds for testing).
     */
    @Scheduled(fixedRate = 5000) // 5 seconds in milliseconds
    @Transactional
    public void checkExpiredBans() {
        LocalDateTime now = LocalDateTime.now();
        
        // Check customer bans
        List<Customer> bannedCustomers = customerRepository.findByIsBannedTrueAndBanOpenDateLessThan(now);
        if (!bannedCustomers.isEmpty()) {
            System.out.println("Removing expired bans for " + bannedCustomers.size() + " customers");
            bannedCustomers.forEach(customer -> {
                customer.setIsBanned(false);
                customer.setBanOpenDate(null);
            });
            customerRepository.saveAll(bannedCustomers);
        }
        
        // Check restaurant bans
        List<Restaurant> bannedRestaurants = restaurantRepository.findByIsBannedTrueAndBanOpenDateLessThan(now);
        if (!bannedRestaurants.isEmpty()) {
            System.out.println("Removing expired bans for " + bannedRestaurants.size() + " restaurants");
            bannedRestaurants.forEach(restaurant -> {
                restaurant.setIsBanned(false);
                restaurant.setBanOpenDate(null);
            });
            restaurantRepository.saveAll(bannedRestaurants);
        }
        
        // Check courier bans
        List<Courier> bannedCouriers = courierRepository.findByIsBannedTrueAndBanOpenDateLessThan(now);
        if (!bannedCouriers.isEmpty()) {
            System.out.println("Removing expired bans for " + bannedCouriers.size() + " couriers");
            bannedCouriers.forEach(courier -> {
                courier.setIsBanned(false);
                courier.setBanOpenDate(null);
            });
            courierRepository.saveAll(bannedCouriers);
        }
    }
} 