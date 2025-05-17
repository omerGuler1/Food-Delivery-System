package com.hufds.service.impl;

import com.hufds.dto.MenuItemDTO;
import com.hufds.entity.MenuItem;
import com.hufds.entity.Restaurant;
import com.hufds.exception.CustomException;
import com.hufds.repository.MenuItemRepository;
import com.hufds.repository.RestaurantRepository;
import com.hufds.service.MenuItemService;
import com.hufds.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuItemServiceImpl implements MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public MenuItem createMenuItem(Integer restaurantId, MenuItemDTO menuItemDTO) {
        Restaurant restaurant = getRestaurantById(restaurantId);
        
        MenuItem menuItem = new MenuItem();
        updateMenuItemFromDTO(menuItem, menuItemDTO);
        menuItem.setRestaurant(restaurant);
        
        return menuItemRepository.save(menuItem);
    }

    @Override
    @Transactional
    public MenuItem updateMenuItem(Integer menuItemId, MenuItemDTO menuItemDTO, Integer restaurantId) {
        MenuItem menuItem = getMenuItemAndValidateRestaurant(menuItemId, restaurantId);
        updateMenuItemFromDTO(menuItem, menuItemDTO);
        return menuItemRepository.save(menuItem);
    }

    @Override
    @Transactional
    public void deleteMenuItem(Integer menuItemId, Integer restaurantId) {
        MenuItem menuItem = getMenuItemAndValidateRestaurant(menuItemId, restaurantId);
        menuItem.setDeletedAt(LocalDateTime.now());
        menuItemRepository.save(menuItem);
    }

    @Override
    public MenuItem getMenuItemById(Integer menuItemId, Integer restaurantId) {
        return getMenuItemAndValidateRestaurant(menuItemId, restaurantId);
    }

    @Override
    public List<MenuItem> getAllMenuItems(Integer restaurantId) {
        return menuItemRepository.findByRestaurantRestaurantIdAndDeletedAtIsNull(restaurantId);
    }

    @Override
    public List<MenuItem> getAvailableMenuItems(Integer restaurantId) {
        return menuItemRepository.findByRestaurantRestaurantIdAndAvailabilityTrueAndDeletedAtIsNull(restaurantId);
    }

    @Override
    public List<MenuItem> getMenuItemsByCategory(Integer restaurantId, String category) {
        return menuItemRepository.findByRestaurantRestaurantIdAndCategoryAndDeletedAtIsNull(restaurantId, category);
    }

    @Override
    @Transactional
    public MenuItem toggleAvailability(Integer menuItemId, Integer restaurantId) {
        MenuItem menuItem = getMenuItemAndValidateRestaurant(menuItemId, restaurantId);
        menuItem.setAvailability(!menuItem.getAvailability());
        return menuItemRepository.save(menuItem);
    }

    @Override
    @Transactional
    public MenuItem uploadMenuItemImage(Integer menuItemId, MultipartFile image, Integer restaurantId) {
        MenuItem menuItem = getMenuItemAndValidateRestaurant(menuItemId, restaurantId);
        
        // Validate image
        if (image.isEmpty()) {
            throw new CustomException("Please select an image to upload", HttpStatus.BAD_REQUEST);
        }
        
        // Validate file type
        String contentType = image.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new CustomException("Only image files are allowed", HttpStatus.BAD_REQUEST);
        }
        
        // Validate file size (max 5MB)
        if (image.getSize() > 5 * 1024 * 1024) {
            throw new CustomException("Image size must be less than 5MB", HttpStatus.BAD_REQUEST);
        }
        
        // Upload image and get URL
        String imageUrl = fileStorageService.storeFile(image, "menu-items");
        
        // Update menu item with new image URL
        menuItem.setImageUrl(imageUrl);
        return menuItemRepository.save(menuItem);
    }

    private Restaurant getRestaurantById(Integer restaurantId) {
        return restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new CustomException("Restaurant not found", HttpStatus.NOT_FOUND));
    }

    private MenuItem getMenuItemAndValidateRestaurant(Integer menuItemId, Integer restaurantId) {
        MenuItem menuItem = menuItemRepository.findByMenuItemIdAndDeletedAtIsNull(menuItemId)
                .orElseThrow(() -> new CustomException("Menu item not found", HttpStatus.NOT_FOUND));

        if (!menuItem.getRestaurant().getRestaurantId().equals(restaurantId)) {
            throw new CustomException("Menu item does not belong to this restaurant", HttpStatus.FORBIDDEN);
        }

        return menuItem;
    }

    private void updateMenuItemFromDTO(MenuItem menuItem, MenuItemDTO dto) {
        menuItem.setName(dto.getName());
        menuItem.setCategory(dto.getCategory());
        menuItem.setDescription(dto.getDescription());
        menuItem.setPrice(dto.getPrice());
        menuItem.setAvailability(dto.getAvailability());
        menuItem.setImageUrl(dto.getImageUrl());
    }
} 