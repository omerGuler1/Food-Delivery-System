package com.hufds.controller;

import com.hufds.dto.MenuItemDTO;
import com.hufds.entity.MenuItem;
import com.hufds.service.JwtService;
import com.hufds.service.MenuItemService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/restaurant/menu-items")
@RequiredArgsConstructor
public class MenuItemController {

    private final MenuItemService menuItemService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<MenuItem> createMenuItem(
            @Valid @RequestBody MenuItemDTO dto,
            HttpServletRequest request) {
        Integer restaurantId = jwtService.extractUserId(getToken(request));
        return ResponseEntity.ok(menuItemService.createMenuItem(restaurantId, dto));
    }

    @GetMapping
    public ResponseEntity<List<MenuItem>> getMenuItems(
            @RequestParam(required = false) Boolean availableOnly,
            @RequestParam(required = false) String category,
            HttpServletRequest request) {
        Integer restaurantId = jwtService.extractUserId(getToken(request));
        
        if (availableOnly != null && availableOnly) {
            return ResponseEntity.ok(menuItemService.getAvailableMenuItems(restaurantId));
        } else if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(menuItemService.getMenuItemsByCategory(restaurantId, category));
        } else {
            return ResponseEntity.ok(menuItemService.getAllMenuItems(restaurantId));
        }
    }

    @GetMapping("/public/{restaurantId}")
    public ResponseEntity<List<MenuItem>> getMenuItemsByRestaurant(
            @PathVariable Integer restaurantId,
            @RequestParam(required = false) Boolean availableOnly,
            @RequestParam(required = false) String category) {
        
        if (availableOnly != null && availableOnly) {
            return ResponseEntity.ok(menuItemService.getAvailableMenuItems(restaurantId));
        } else if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(menuItemService.getMenuItemsByCategory(restaurantId, category));
        } else {
            return ResponseEntity.ok(menuItemService.getAllMenuItems(restaurantId));
        }
    }

    @GetMapping("/{menuItemId}")
    public ResponseEntity<MenuItem> getMenuItem(
            @PathVariable Integer menuItemId,
            HttpServletRequest request) {
        Integer restaurantId = jwtService.extractUserId(getToken(request));
        return ResponseEntity.ok(menuItemService.getMenuItemById(menuItemId, restaurantId));
    }

    @PutMapping("/{menuItemId}")
    public ResponseEntity<MenuItem> updateMenuItem(
            @PathVariable Integer menuItemId,
            @Valid @RequestBody MenuItemDTO dto,
            HttpServletRequest request) {
        Integer restaurantId = jwtService.extractUserId(getToken(request));
        return ResponseEntity.ok(menuItemService.updateMenuItem(menuItemId, dto, restaurantId));
    }

    @DeleteMapping("/{menuItemId}")
    public ResponseEntity<Void> deleteMenuItem(
            @PathVariable Integer menuItemId,
            HttpServletRequest request) {
        Integer restaurantId = jwtService.extractUserId(getToken(request));
        menuItemService.deleteMenuItem(menuItemId, restaurantId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{menuItemId}/availability")
    public ResponseEntity<MenuItem> toggleAvailability(
            @PathVariable Integer menuItemId,
            HttpServletRequest request) {
        Integer restaurantId = jwtService.extractUserId(getToken(request));
        return ResponseEntity.ok(menuItemService.toggleAvailability(menuItemId, restaurantId));
    }

    @PostMapping("/{menuItemId}/image")
    public ResponseEntity<MenuItem> uploadMenuItemImage(
            @PathVariable Integer menuItemId,
            @RequestParam("image") MultipartFile image,
            HttpServletRequest request) {
        Integer restaurantId = jwtService.extractUserId(getToken(request));
        return ResponseEntity.ok(menuItemService.uploadMenuItemImage(menuItemId, image, restaurantId));
    }

    private String getToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        throw new RuntimeException("Authorization header missing or invalid");
    }
}
