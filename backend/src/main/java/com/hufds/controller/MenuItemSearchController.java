package com.hufds.controller;

import com.hufds.dto.MenuItemSearchDTO;
import com.hufds.dto.MenuItemSearchResultDTO;
import com.hufds.service.MenuItemSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/menu-items")
@RequiredArgsConstructor
public class MenuItemSearchController {

    private final MenuItemSearchService menuItemSearchService;

    @GetMapping("/search")
    public ResponseEntity<List<MenuItemSearchResultDTO>> searchMenuItems(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean isAvailable,
            @RequestParam(required = false) Integer restaurantId) {
        
        MenuItemSearchDTO searchDTO = MenuItemSearchDTO.builder()
                .name(name)
                .category(category)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .isAvailable(isAvailable)
                .restaurantId(restaurantId)
                .build();

        List<MenuItemSearchResultDTO> results = menuItemSearchService.searchMenuItems(searchDTO);
        return ResponseEntity.ok(results);
    }

    @PostMapping("/search")
    public ResponseEntity<List<MenuItemSearchResultDTO>> searchMenuItems(
            @RequestBody MenuItemSearchDTO searchDTO) {
        List<MenuItemSearchResultDTO> results = menuItemSearchService.searchMenuItems(searchDTO);
        return ResponseEntity.ok(results);
    }
} 