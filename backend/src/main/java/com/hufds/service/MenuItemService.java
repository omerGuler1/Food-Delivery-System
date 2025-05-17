package com.hufds.service;

import com.hufds.dto.MenuItemDTO;
import com.hufds.entity.MenuItem;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MenuItemService {
    MenuItem createMenuItem(Integer restaurantId, MenuItemDTO menuItemDTO);
    MenuItem updateMenuItem(Integer menuItemId, MenuItemDTO menuItemDTO, Integer restaurantId);
    void deleteMenuItem(Integer menuItemId, Integer restaurantId);
    MenuItem getMenuItemById(Integer menuItemId, Integer restaurantId);
    List<MenuItem> getAllMenuItems(Integer restaurantId);
    List<MenuItem> getAvailableMenuItems(Integer restaurantId);
    List<MenuItem> getMenuItemsByCategory(Integer restaurantId, String category);
    MenuItem toggleAvailability(Integer menuItemId, Integer restaurantId);
    MenuItem uploadMenuItemImage(Integer menuItemId, MultipartFile image, Integer restaurantId);
}
