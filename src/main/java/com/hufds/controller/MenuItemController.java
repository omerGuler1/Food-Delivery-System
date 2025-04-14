package com.hufds.controller;

import com.hufds.dto.CreateMenuItemDTO;
import com.hufds.dto.DeleteResponseDTO;
import com.hufds.dto.UpdateMenuItemDTO;
import com.hufds.entity.MenuItem;
import com.hufds.service.JwtService;
import com.hufds.service.MenuItemService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurant/menu-items")
@RequiredArgsConstructor
public class MenuItemController {

    private final MenuItemService menuItemService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<MenuItem> addMenuItem(
            @Valid @RequestBody CreateMenuItemDTO dto,
            HttpServletRequest request) {

        Integer restaurantId = jwtService.extractUserId(getToken(request));
        return ResponseEntity.ok(menuItemService.addMenuItem(restaurantId, dto));
    }

    @GetMapping
    public ResponseEntity<List<MenuItem>> listMenuItems(HttpServletRequest request) {
        Integer restaurantId = jwtService.extractUserId(getToken(request));
        return ResponseEntity.ok(menuItemService.listMenuItems(restaurantId));
    }

    @PutMapping("/{menuItemId}")
    public ResponseEntity<MenuItem> updateMenuItem(
            @PathVariable Integer menuItemId,
            @Valid @RequestBody UpdateMenuItemDTO dto,
            HttpServletRequest request) {

        Integer restaurantId = jwtService.extractUserId(getToken(request));
        return ResponseEntity.ok(menuItemService.updateMenuItem(menuItemId, dto, restaurantId));
    }

    @DeleteMapping("/{menuItemId}")
    public ResponseEntity<DeleteResponseDTO> deleteMenuItem(
            @PathVariable Integer menuItemId,
            HttpServletRequest request) {

        Integer restaurantId = jwtService.extractUserId(getToken(request));
        boolean isDeleted = menuItemService.deleteMenuItem(menuItemId, restaurantId);

        DeleteResponseDTO response = new DeleteResponseDTO();
        response.setSuccess(isDeleted);
        response.setMessage(isDeleted ?
                "Menu item with ID " + menuItemId + " was successfully deleted" :
                "Failed to delete menu item with ID " + menuItemId);

        return ResponseEntity.ok(response);
    }

    private String getToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        throw new RuntimeException("Authorization header missing or invalid");
    }
}
