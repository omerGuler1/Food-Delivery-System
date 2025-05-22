package com.hufds.service.impl;

import com.hufds.dto.FeeDTO;
import com.hufds.dto.FeeUpdateRequest;
import com.hufds.entity.Fee;
import com.hufds.repository.FeeRepository;
import com.hufds.service.FeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FeeServiceImpl implements FeeService {

    private static final Long DEFAULT_FEE_ID = 1L;
    private static final Double DEFAULT_FEE_VALUE = 15.0;
    
    private final FeeRepository feeRepository;
    
    @Override
    @Transactional(readOnly = true)
    public FeeDTO getDeliveryFee() {
        Fee fee = feeRepository.findById(DEFAULT_FEE_ID)
                .orElseGet(() -> createDefaultDeliveryFee());
        
        return mapToDTO(fee);
    }
    
    @Override
    @Transactional
    public FeeDTO updateDeliveryFee(FeeUpdateRequest request) {
        Fee fee = feeRepository.findById(DEFAULT_FEE_ID)
                .orElseGet(() -> createDefaultDeliveryFee());
        
        fee.setFee(request.getValue());
        
        Fee savedFee = feeRepository.save(fee);
        
        return mapToDTO(savedFee);
    }
    
    private Fee createDefaultDeliveryFee() {
        Fee fee = Fee.builder()
                .fee(DEFAULT_FEE_VALUE)
                .build();
        
        return feeRepository.save(fee);
    }
    
    private FeeDTO mapToDTO(Fee fee) {
        return FeeDTO.builder()
                .id(fee.getId())
                .fee(fee.getFee())
                .build();
    }
} 