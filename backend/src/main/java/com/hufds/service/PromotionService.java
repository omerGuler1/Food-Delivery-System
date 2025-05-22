package com.hufds.service;

import com.hufds.dto.PromotionDTO;
import java.util.List;

public interface PromotionService {
    PromotionDTO createPromotion(PromotionDTO promotionDTO);
    List<PromotionDTO> getAllActivePromotions();
    List<PromotionDTO> getAllInactivePromotions();
    PromotionDTO getPromotionById(Long id);
    PromotionDTO updatePromotion(Long id, PromotionDTO promotionDTO);
    void deletePromotion(Long id);
    PromotionDTO togglePromotionStatus(Long id);
} 