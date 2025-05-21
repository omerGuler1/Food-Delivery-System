package com.hufds.service.impl;

import com.hufds.entity.Customer;
import com.hufds.entity.FavoriteRestaurant;
import com.hufds.entity.Restaurant;
import com.hufds.exception.CustomException;
import com.hufds.repository.FavoriteRestaurantRepository;
import com.hufds.repository.RestaurantRepository;
import com.hufds.service.FavoriteRestaurantService;
import com.hufds.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteRestaurantServiceImpl implements FavoriteRestaurantService {

    private final FavoriteRestaurantRepository favoriteRestaurantRepository;
    private final RestaurantRepository restaurantRepository;
    private final ProfileService profileService;

    @Override
    @Transactional
    public void addFavoriteRestaurant(Integer restaurantId) {
        Customer currentUser = profileService.getCurrentProfile();
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new CustomException("Restaurant not found", HttpStatus.NOT_FOUND));

        // Check if already favorited
        boolean alreadyFavorited = favoriteRestaurantRepository.existsByCustomerAndRestaurant(currentUser, restaurant);
        if (alreadyFavorited) {
            return; // Already favorited, do nothing
        }

        // Create new favorite entry
        FavoriteRestaurant favoriteRestaurant = new FavoriteRestaurant();
        favoriteRestaurant.setCustomer(currentUser);
        favoriteRestaurant.setRestaurant(restaurant);
        favoriteRestaurant.setCreatedAt(LocalDateTime.now());
        
        favoriteRestaurantRepository.save(favoriteRestaurant);
    }

    @Override
    @Transactional
    public void removeFavoriteRestaurant(Integer restaurantId) {
        Customer currentUser = profileService.getCurrentProfile();
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new CustomException("Restaurant not found", HttpStatus.NOT_FOUND));

        favoriteRestaurantRepository.findByCustomerAndRestaurant(currentUser, restaurant)
                .ifPresent(favoriteRestaurantRepository::delete);
    }

    @Override
    public List<Restaurant> getCurrentUserFavoriteRestaurants() {
        Customer currentUser = profileService.getCurrentProfile();
        
        return favoriteRestaurantRepository.findByCustomer(currentUser).stream()
                .map(FavoriteRestaurant::getRestaurant)
                .collect(Collectors.toList());
    }

    @Override
    public boolean isRestaurantFavorited(Integer restaurantId) {
        Customer currentUser = profileService.getCurrentProfile();
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new CustomException("Restaurant not found", HttpStatus.NOT_FOUND));
        
        return favoriteRestaurantRepository.existsByCustomerAndRestaurant(currentUser, restaurant);
    }
} 