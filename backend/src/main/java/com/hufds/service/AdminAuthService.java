package com.hufds.service;

import com.hufds.dto.AdminLoginDTO;
import com.hufds.dto.AdminRegisterDTO;
import com.hufds.dto.AdminResponseDTO;

public interface AdminAuthService {
    AdminResponseDTO register(AdminRegisterDTO registerDTO);
    AdminResponseDTO login(AdminLoginDTO loginDTO);
}
