package com.hufds.service.impl;

import com.hufds.dto.PromotionDTO;
import com.hufds.entity.Promotion;
import com.hufds.exception.ResourceNotFoundException;
import com.hufds.repository.PromotionRepository;
import com.hufds.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PromotionServiceImpl implements PromotionService {

    private static final Logger logger = LoggerFactory.getLogger(PromotionServiceImpl.class);

    private final PromotionRepository promotionRepository;

    @Autowired
    public PromotionServiceImpl(PromotionRepository promotionRepository) {
        this.promotionRepository = promotionRepository;
    }

    @Override
    public PromotionDTO createPromotion(PromotionDTO promotionDTO) {
        Promotion promotion = convertToEntity(promotionDTO);
        Promotion savedPromotion = promotionRepository.save(promotion);
        return convertToDTO(savedPromotion);
    }

    @Override
    public List<PromotionDTO> getAllActivePromotions() {
        return promotionRepository.findByIsActiveAndDeletedAtIsNull(true)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PromotionDTO> getAllInactivePromotions() {
        return promotionRepository.findByIsActiveAndDeletedAtIsNull(false)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PromotionDTO getPromotionById(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + id));
        return convertToDTO(promotion);
    }

    @Override
    public PromotionDTO updatePromotion(Long id, PromotionDTO promotionDTO) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + id));
        
        promotion.setName(promotionDTO.getName());
        promotion.setDescription(promotionDTO.getDescription());
        promotion.setDiscountPercentage(promotionDTO.getDiscountPercentage());
        promotion.setEndDate(promotionDTO.getEndDate());
        promotion.setIsActive(promotionDTO.getIsActive());
        
        Promotion updatedPromotion = promotionRepository.save(promotion);
        return convertToDTO(updatedPromotion);
    }

    @Override
    public void deletePromotion(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + id));
        
        promotion.setDeletedAt(LocalDateTime.now());
        promotionRepository.save(promotion);
    }

    @Override
    public PromotionDTO togglePromotionStatus(Long id) {
        logger.info("Toggling promotion status for ID: {}", id);
        
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + id));
        
        Boolean currentStatus = promotion.getIsActive();
        logger.info("Current status of promotion {}: {}", id, currentStatus);
        
        promotion.setIsActive(!currentStatus);
        logger.info("New status of promotion {}: {}", id, !currentStatus);
        
        Promotion updatedPromotion = promotionRepository.save(promotion);
        logger.info("Promotion updated successfully, new status: {}", updatedPromotion.getIsActive());
        
        return convertToDTO(updatedPromotion);
    }
    
    private Promotion convertToEntity(PromotionDTO promotionDTO) {
        return Promotion.builder()
                .id(promotionDTO.getId())
                .name(promotionDTO.getName())
                .description(promotionDTO.getDescription())
                .discountPercentage(promotionDTO.getDiscountPercentage())
                .endDate(promotionDTO.getEndDate())
                .isActive(promotionDTO.getIsActive())
                .build();
    }
    
    private PromotionDTO convertToDTO(Promotion promotion) {
        return PromotionDTO.builder()
                .id(promotion.getId())
                .name(promotion.getName())
                .description(promotion.getDescription())
                .discountPercentage(promotion.getDiscountPercentage())
                .endDate(promotion.getEndDate())
                .isActive(promotion.getIsActive())
                .build();
    }
} 