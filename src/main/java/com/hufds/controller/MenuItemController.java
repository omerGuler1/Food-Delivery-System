package com.hufds.controller;

import com.hufds.dto.CreateMenuItemDTO;
import com.hufds.dto.UpdateMenuItemDTO;
import com.hufds.entity.MenuItem;
import com.hufds.service.MenuItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurant/{restaurantId}/menu-items")
public class MenuItemController {

    @Autowired
    private MenuItemService menuItemService;

    @PostMapping
    public ResponseEntity<MenuItem> addMenuItem(@PathVariable Integer restaurantId, @RequestBody CreateMenuItemDTO dto) {
        System.out.println("🎯 Reached POST /menu-items");
        System.out.println("➡️ DTO name: " + dto.getName());
        return ResponseEntity.ok(menuItemService.addMenuItem(restaurantId, dto));
    }

    @GetMapping
    public ResponseEntity<List<MenuItem>> listMenuItems(@PathVariable Integer restaurantId) {
        return ResponseEntity.ok(menuItemService.listMenuItems(restaurantId));
    }

    @PutMapping("/{menuItemId}")
    public ResponseEntity<MenuItem> updateMenuItem(@PathVariable Integer menuItemId, @RequestBody UpdateMenuItemDTO dto) {
        return ResponseEntity.ok(menuItemService.updateMenuItem(menuItemId, dto));
    }

    @DeleteMapping("/{menuItemId}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Integer menuItemId) {
        menuItemService.deleteMenuItem(menuItemId);
        return ResponseEntity.noContent().build();
    }
}
