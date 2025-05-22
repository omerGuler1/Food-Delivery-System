package com.hufds.service;

import com.hufds.dto.FeeDTO;
import com.hufds.dto.FeeUpdateRequest;

public interface FeeService {
    FeeDTO getDeliveryFee();
    FeeDTO updateDeliveryFee(FeeUpdateRequest request);
} 