package com.hufds.service;

import com.hufds.dto.CustomerLoginDTO;
import com.hufds.dto.CustomerRegisterDTO;
import com.hufds.dto.CustomerResponseDTO;

public interface CustomerAuthService {
    CustomerResponseDTO register(CustomerRegisterDTO registerDTO);
    CustomerResponseDTO login(CustomerLoginDTO loginDTO);
}
