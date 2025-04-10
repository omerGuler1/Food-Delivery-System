package com.hufds.service;

import com.hufds.dto.AuthRequest;
import com.hufds.dto.AuthResponse;
import com.hufds.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(AuthRequest request);
} 