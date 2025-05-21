package com.hufds.service;

import com.hufds.entity.Restaurant;

import java.util.List;

public interface FavoriteRestaurantService {
    void addFavoriteRestaurant(Integer restaurantId);
    void removeFavoriteRestaurant(Integer restaurantId);
    List<Restaurant> getCurrentUserFavoriteRestaurants();
    boolean isRestaurantFavorited(Integer restaurantId);
} 