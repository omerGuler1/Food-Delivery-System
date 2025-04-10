package com.hufds.service.impl;

import com.hufds.dto.AuthRequest;
import com.hufds.dto.AuthResponse;
import com.hufds.dto.RegisterRequest;
import com.hufds.exception.ValidationException;
import com.hufds.repository.UserRepository;
import com.hufds.security.JwtService;
import com.hufds.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate the request
        validateRegistrationRequest(request);

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email already registered");
        }

        // Create new user
        var user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole())
                .phoneNumber(request.getPhoneNumber())
                .enabled(true)
                .build();

        userRepository.save(user);
        
        // Generate token with standard expiration
        var token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole())
                .fullName(user.getFullName())
                .build();
    }

    @Override
    public AuthResponse login(AuthRequest request) {
        // Authenticate user
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Get user details
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ValidationException("Invalid email or password"));

        // Generate token with extended expiration if remember me is true
        var token = request.isRememberMe() 
                ? jwtService.generateTokenWithExtendedExpiration(user)
                : jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole())
                .fullName(user.getFullName())
                .build();
    }

    private void validateRegistrationRequest(RegisterRequest request) {
        List<String> errors = new ArrayList<>();

        // Validate password confirmation
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            errors.add("Passwords do not match");
        }

        // Validate terms acceptance
        if (!request.isTermsAccepted()) {
            errors.add("You must accept the terms and conditions");
        }

        // If there are any validation errors, throw exception
        if (!errors.isEmpty()) {
            throw new ValidationException(String.join(", ", errors));
        }
    }
} 