package com.hufds.service;

import com.hufds.DTOs.CreateMenuItemDTO;
import com.hufds.DTOs.UpdateMenuItemDTO;
import com.hufds.entity.MenuItem;
import com.hufds.entity.Restaurant;
import com.hufds.repository.MenuItemRepository;
import com.hufds.repository.RestaurantRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
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
        item.setRestaurant(restaurant);

        MenuItem saved = menuItemRepository.save(item);
        System.out.println("Saved menu item: " + saved.getMenuItemId());

        return saved;
    }

    public List<MenuItem> listMenuItems(Integer restaurantId) {
        return menuItemRepository.findByRestaurantRestaurantId(restaurantId);
    }

    public MenuItem updateMenuItem(Integer menuItemId, UpdateMenuItemDTO dto) {
        MenuItem item = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new EntityNotFoundException("MenuItem not found"));
        item.setName(dto.getName());
        item.setDescription(dto.getDescription());
        item.setPrice(dto.getPrice());
        item.setAvailability(dto.getAvailability());
        return menuItemRepository.save(item);
    }

    public void deleteMenuItem(Integer menuItemId) {
        menuItemRepository.deleteById(menuItemId);
    }
}
