package com.hufds.service;

import com.hufds.dto.CreateMenuItemDTO;
import com.hufds.dto.UpdateMenuItemDTO;
import com.hufds.entity.MenuItem;
import com.hufds.entity.Restaurant;
import com.hufds.exception.CustomException;
import com.hufds.repository.MenuItemRepository;
import com.hufds.repository.RestaurantRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MenuItemService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;
    @Transactional
    public MenuItem addMenuItem(Integer restaurantId, CreateMenuItemDTO dto) {

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new EntityNotFoundException("Restaurant not found"));

        System.out.println("Found restaurant: " + restaurant.getName());

        MenuItem item = new MenuItem();
        item.setName(dto.getName());
        item.setDescription(dto.getDescription());
        item.setPrice(dto.getPrice());
        item.setAvailability(dto.getAvailability());
        item.setCategory(dto.getCategory());
        item.setRestaurant(restaurant);

        MenuItem saved = menuItemRepository.save(item);
        System.out.println("Saved menu item: " + saved.getMenuItemId());

        return saved;
    }

    public List<MenuItem> listMenuItems(Integer restaurantId) {
        return menuItemRepository.findByRestaurantRestaurantId(restaurantId);
    }

    public MenuItem updateMenuItem(Integer menuItemId, UpdateMenuItemDTO dto, Integer restaurantId) {
        MenuItem item = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new EntityNotFoundException("MenuItem not found"));

        // Güvenlik kontrolü: MenuItem'ın restaurant ID'si ile token'dan gelen restaurant ID'nin aynı olması gerekir
        if (!item.getRestaurant().getRestaurantId().equals(restaurantId)) {
            throw new CustomException("You don't have permission to update this menu item", HttpStatus.FORBIDDEN);
        }

        item.setName(dto.getName());
        item.setDescription(dto.getDescription());
        item.setPrice(dto.getPrice());
        item.setAvailability(dto.getAvailability());
        item.setCategory(dto.getCategory());
        return menuItemRepository.save(item);
    }

    public boolean deleteMenuItem(Integer menuItemId, Integer restaurantId) {
        try {
            MenuItem item = menuItemRepository.findById(menuItemId)
                    .orElseThrow(() -> new EntityNotFoundException("MenuItem not found"));

            // Güvenlik kontrolü: MenuItem'ın restaurant ID'si ile token'dan gelen restaurant ID'nin aynı olması gerekir
            if (!item.getRestaurant().getRestaurantId().equals(restaurantId)) {
                throw new CustomException("You don't have permission to delete this menu item", HttpStatus.FORBIDDEN);
            }

            menuItemRepository.deleteById(menuItemId);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
