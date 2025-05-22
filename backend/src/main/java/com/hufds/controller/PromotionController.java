package com.hufds.controller;

import com.hufds.dto.PromotionDTO;
import com.hufds.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/promotions")
@CrossOrigin(origins = "*")
public class PromotionController {

    private final PromotionService promotionService;

    @Autowired
    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @PostMapping
    public ResponseEntity<PromotionDTO> createPromotion(@RequestBody PromotionDTO promotionDTO) {
        PromotionDTO createdPromotion = promotionService.createPromotion(promotionDTO);
        return new ResponseEntity<>(createdPromotion, HttpStatus.CREATED);
    }

    @GetMapping("/active")
    public ResponseEntity<List<PromotionDTO>> getAllActivePromotions() {
        List<PromotionDTO> promotions = promotionService.getAllActivePromotions();
        return ResponseEntity.ok(promotions);
    }

    @GetMapping("/inactive")
    public ResponseEntity<List<PromotionDTO>> getAllInactivePromotions() {
        List<PromotionDTO> promotions = promotionService.getAllInactivePromotions();
        return ResponseEntity.ok(promotions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PromotionDTO> getPromotionById(@PathVariable Long id) {
        PromotionDTO promotion = promotionService.getPromotionById(id);
        return ResponseEntity.ok(promotion);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PromotionDTO> updatePromotion(@PathVariable Long id, @RequestBody PromotionDTO promotionDTO) {
        PromotionDTO updatedPromotion = promotionService.updatePromotion(id, promotionDTO);
        return ResponseEntity.ok(updatedPromotion);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deletePromotion(@PathVariable Long id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.ok(Map.of("message", "Promotion deleted successfully"));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<PromotionDTO> togglePromotionStatus(@PathVariable Long id) {
        PromotionDTO promotion = promotionService.togglePromotionStatus(id);
        return ResponseEntity.ok(promotion);
    }
} 