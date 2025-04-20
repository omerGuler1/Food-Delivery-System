package com.hufds.service.impl;

import com.hufds.dto.MenuItemSearchDTO;
import com.hufds.dto.MenuItemSearchResultDTO;
import com.hufds.entity.MenuItem;
import com.hufds.repository.MenuItemRepository;
import com.hufds.service.MenuItemSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuItemSearchServiceImpl implements MenuItemSearchService {

    private final MenuItemRepository menuItemRepository;

    @Override
    public List<MenuItemSearchResultDTO> searchMenuItems(MenuItemSearchDTO searchDTO) {
        Set<MenuItem> results = new HashSet<>();

        // If no search criteria provided, return all items
        if (searchDTO.getName() == null && 
            searchDTO.getCategory() == null && 
            searchDTO.getMinPrice() == null && 
            searchDTO.getMaxPrice() == null && 
            searchDTO.getIsAvailable() == null && 
            searchDTO.getRestaurantId() == null) {
            return menuItemRepository.findAll().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        }

        // Search by restaurant ID first if provided
        if (searchDTO.getRestaurantId() != null) {
            results.addAll(menuItemRepository.findByRestaurantRestaurantId(searchDTO.getRestaurantId()));
        } else {
            results.addAll(menuItemRepository.findAll());
        }

        // Apply additional filters
        if (searchDTO.getName() != null) {
            Set<MenuItem> nameResults = new HashSet<>();
            if (searchDTO.getRestaurantId() != null) {
                nameResults.addAll(menuItemRepository.findByRestaurantRestaurantIdAndNameContainingIgnoreCase(
                    searchDTO.getRestaurantId(), searchDTO.getName()));
            } else {
                nameResults.addAll(menuItemRepository.findByNameContainingIgnoreCase(searchDTO.getName()));
            }
            results.retainAll(nameResults);
        }

        if (searchDTO.getCategory() != null) {
            Set<MenuItem> categoryResults = new HashSet<>();
            if (searchDTO.getRestaurantId() != null) {
                categoryResults.addAll(menuItemRepository.findByRestaurantRestaurantIdAndCategoryContainingIgnoreCase(
                    searchDTO.getRestaurantId(), searchDTO.getCategory()));
            } else {
                categoryResults.addAll(menuItemRepository.findByCategoryContainingIgnoreCase(searchDTO.getCategory()));
            }
            results.retainAll(categoryResults);
        }

        if (searchDTO.getMinPrice() != null || searchDTO.getMaxPrice() != null) {
            BigDecimal minPrice = searchDTO.getMinPrice() != null ? searchDTO.getMinPrice() : BigDecimal.ZERO;
            BigDecimal maxPrice = searchDTO.getMaxPrice() != null ? searchDTO.getMaxPrice() : new BigDecimal("999999.99");
            
            Set<MenuItem> priceResults = new HashSet<>();
            if (searchDTO.getRestaurantId() != null) {
                priceResults.addAll(menuItemRepository.findByRestaurantRestaurantIdAndPriceBetween(
                    searchDTO.getRestaurantId(), minPrice, maxPrice));
            } else {
                priceResults.addAll(menuItemRepository.findByPriceBetween(minPrice, maxPrice));
            }
            results.retainAll(priceResults);
        }

        if (searchDTO.getIsAvailable() != null) {
            Set<MenuItem> availabilityResults = new HashSet<>();
            if (searchDTO.getRestaurantId() != null) {
                availabilityResults.addAll(menuItemRepository.findByRestaurantRestaurantIdAndAvailability(
                    searchDTO.getRestaurantId(), searchDTO.getIsAvailable()));
            } else {
                availabilityResults.addAll(menuItemRepository.findByAvailability(searchDTO.getIsAvailable()));
            }
            results.retainAll(availabilityResults);
        }

        return results.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private MenuItemSearchResultDTO convertToDTO(MenuItem menuItem) {
        return MenuItemSearchResultDTO.builder()
                .id(menuItem.getMenuItemId())
                .name(menuItem.getName())
                .description(menuItem.getDescription())
                .price(menuItem.getPrice())
                .category(menuItem.getCategory())
                .imageUrl(menuItem.getImageUrl())
                .isAvailable(menuItem.getAvailability())
                .restaurantId(menuItem.getRestaurant().getRestaurantId())
                .restaurantName(menuItem.getRestaurant().getName())
                .build();
    }
} 